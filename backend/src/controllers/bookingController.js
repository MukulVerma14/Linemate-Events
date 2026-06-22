const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { eventId, seatsBooked } = req.body;

    // Validation
    if (!eventId || !seatsBooked) {
      return res.status(400).json({ success: false, message: 'Please provide eventId and seatsBooked' });
    }

    const seatsToBook = parseInt(seatsBooked, 10);
    if (isNaN(seatsToBook) || seatsToBook <= 0) {
      return res.status(400).json({ success: false, message: 'Number of seats must be a positive integer' });
    }

    // Try to atomically reserve seats from Event
    // This query finds the event and decrements availableSeats in a single atomic database operation,
    // but ONLY if the availableSeats is greater than or equal to the seats requested.
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: seatsToBook } },
      { $inc: { availableSeats: -seatsToBook } },
      { new: true, runValidators: true }
    );

    // If updatedEvent is null, either the event doesn't exist, or there are not enough seats
    if (!updatedEvent) {
      const eventCheck = await Event.findById(eventId);
      if (!eventCheck) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      return res.status(400).json({
        success: false,
        message: `Booking failed. Only ${eventCheck.availableSeats} of the requested ${seatsToBook} seats are available.`,
      });
    }

    // Event seats updated successfully, now create the Booking record
    try {
      const booking = await Booking.create({
        user: req.user._id,
        event: eventId,
        seatsBooked: seatsToBook,
        status: 'Active',
      });

      // Populate event information before sending response
      const populatedBooking = await Booking.findById(booking._id).populate('event');

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully!',
        data: populatedBooking,
      });
    } catch (bookingError) {
      // Rollback the event seats change if booking creation fails
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: seatsToBook } });
      console.error('Failed to create booking document, rolling back seats:', bookingError);
      return res.status(500).json({ success: false, message: 'Error confirming booking, rolled back.' });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error booking event' });
  }
};

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ bookingDate: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Atomically find the active booking and mark it as Cancelled
    // This prevents double-cancellation and unauthorized cancellations
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, user: req.user._id, status: 'Active' },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!booking) {
      // Check if it already exists or was already cancelled
      const checkBooking = await Booking.findById(bookingId);
      if (!checkBooking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      if (checkBooking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
      }
      if (checkBooking.status === 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }
    }

    // Add seatsBooked back to Event's availableSeats
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableSeats: booking.seatsBooked },
    });

    const populatedBooking = await Booking.findById(booking._id).populate('event');

    return res.json({
      success: true,
      message: 'Booking cancelled successfully, seats returned to inventory.',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};

// @desc    Partially cancel a booking (granular ticket release)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBookingPartial = async (req, res) => {
  let session;
  try {
    const bookingId = req.params.id;
    const { seatsToCancel } = req.body;

    const cancelCount = parseInt(seatsToCancel, 10);
    if (isNaN(cancelCount) || cancelCount <= 0) {
      return res.status(400).json({ success: false, message: 'seatsToCancel must be a positive integer' });
    }

    // Attempt to start a Mongoose transaction session
    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id, status: 'Active' }).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Active booking not found' });
    }

    if (cancelCount > booking.seatsBooked) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${cancelCount} seats. You only have ${booking.seatsBooked} seats booked.`,
      });
    }

    // 1. Subtract seatsToCancel from booking.seatsBooked
    booking.seatsBooked -= cancelCount;

    // 3. If booking.seatsBooked reaches exactly 0, automatically change booking.status to 'Cancelled'
    if (booking.seatsBooked === 0) {
      booking.status = 'Cancelled';
    }

    await booking.save({ session });

    // 2. Add seatsToCancel back to Event.availableSeats
    const event = await Event.findById(booking.event).session(session);
    if (!event) {
      throw new Error('Event associated with this booking not found');
    }

    event.availableSeats += cancelCount;
    await event.save({ session });

    // Commit Mongoose transaction
    await session.commitTransaction();
    session.endSession();

    const populatedBooking = await Booking.findById(booking._id).populate('event');

    return res.json({
      success: true,
      message: `Successfully released ${cancelCount} seats.`,
      data: populatedBooking,
    });
  } catch (error) {
    if (session) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
    }

    // Check if error is due to standalone MongoDB instance (no replica set configured)
    if (
      error.message.includes('replica set') || 
      error.codeName === 'TransactionNumbersWithoutRetryableWrites' || 
      error.message.includes('sessions are not supported')
    ) {
      console.log('Mongoose session transaction unsupported by standalone DB. Falling back to sequential execution...');
      return await handleStandaloneCancellation(req, res);
    }

    console.error('Mongoose session transaction error:', error);
    return res.status(500).json({ success: false, message: 'Server error during partial cancellation transaction' });
  }
};

// Fallback execution helper for standalone MongoDB setups
const handleStandaloneCancellation = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { seatsToCancel } = req.body;

    const cancelCount = parseInt(seatsToCancel, 10);
    if (isNaN(cancelCount) || cancelCount <= 0) {
      return res.status(400).json({ success: false, message: 'seatsToCancel must be a positive integer' });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id, status: 'Active' });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Active booking not found' });
    }

    if (cancelCount > booking.seatsBooked) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${cancelCount} seats. You only have ${booking.seatsBooked} seats booked.`,
      });
    }

    booking.seatsBooked -= cancelCount;
    if (booking.seatsBooked === 0) {
      booking.status = 'Cancelled';
    }

    await booking.save();

    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableSeats: cancelCount }
    });

    const populatedBooking = await Booking.findById(booking._id).populate('event');

    return res.json({
      success: true,
      message: `Successfully released ${cancelCount} seats (standalone).`,
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Standalone partial cancellation error:', error);
    return res.status(500).json({ success: false, message: 'Server error during standalone partial cancellation' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  cancelBookingPartial,
};
