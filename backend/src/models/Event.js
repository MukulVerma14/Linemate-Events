const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an event name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
    },
    date: {
      type: Date,
      required: [true, 'Please add an event date'],
    },
    time: {
      type: String,
      required: [true, 'Please add an event time (e.g. 18:00)'],
    },
    venue: {
      type: String,
      required: [true, 'Please add an event venue'],
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please add total seats'],
      min: [1, 'Total seats must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: [true, 'Please add available seats'],
      min: [0, 'Available seats cannot be negative'],
      validate: {
        validator: function (value) {
          return value <= this.totalSeats;
        },
        message: 'Available seats cannot be greater than total seats',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', EventSchema);
