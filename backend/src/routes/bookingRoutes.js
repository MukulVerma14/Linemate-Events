const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, cancelBookingPartial } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Protect all routes under booking
router.use(protect);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.patch('/:id/cancel', cancelBookingPartial);
router.delete('/:id', cancelBooking);

module.exports = router;
