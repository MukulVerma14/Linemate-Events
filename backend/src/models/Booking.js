const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Booking must reference an event'],
    },
    seatsBooked: {
      type: Number,
      required: [true, 'Please specify the number of seats to book'],
      validate: {
        validator: function (value) {
          const status = this ? (this.status || (typeof this.getUpdate === 'function' && this.getUpdate() && this.getUpdate().status)) : undefined;
          if (status === 'Cancelled') {
            return value >= 0;
          }
          return value >= 1;
        },
        message: 'Must book at least 1 seat for an active booking',
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled'],
      default: 'Active',
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
