const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const events = [
  {
    name: 'Tech Innovators Summit 2026',
    description: 'A futuristic tech conference with keynote speeches, live demos, and premium networking sessions. Learn about AI, Quantum Computing, and Web3 development from industry experts.',
    date: new Date('2026-08-15T09:00:00.000Z'),
    time: '09:00 AM - 05:00 PM',
    venue: 'San Francisco Innovation Hub, CA',
    totalSeats: 150,
    availableSeats: 150,
  },
  {
    name: 'Global Music & Arts Festival',
    description: 'Experience an unforgettable evening of live orchestra, interactive visual arts installations, and multiple indie bands. Food trucks, beverages, and merchandise are included.',
    date: new Date('2026-09-10T16:30:00.000Z'),
    time: '04:30 PM - 11:00 PM',
    venue: 'Central Park Amphitheater, NY',
    totalSeats: 500,
    availableSeats: 500,
  },
  {
    name: 'Deep Dive React & Node Workshop',
    description: 'An intensive, hands-on masterclass targeting advanced patterns in React (Vite, Tailwind, Framer Motion) and Node.js backend optimization. Limited capacity to ensure personal feedback.',
    date: new Date('2026-07-20T09:00:00.000Z'),
    time: '09:00 AM - 04:00 PM',
    venue: 'Seattle Tech Campus, WA & Virtual',
    totalSeats: 50,
    availableSeats: 50,
  },
  {
    name: 'Sustainable Living & Green Tech Expo',
    description: 'Discover eco-friendly building solutions, renewable energy products, and sustainable agricultural techniques. Ideal for designers, builders, and green tech enthusiasts.',
    date: new Date('2026-10-05T10:00:00.000Z'),
    time: '10:00 AM - 06:00 PM',
    venue: 'Denver Eco Center, CO',
    totalSeats: 250,
    availableSeats: 250,
  },
  {
    name: 'International Culinary Masterclass',
    description: 'Join Michelin-star chefs for an interactive, live cooking show, wine pairing session, and private dinner. Ingredients and souvenir chef aprons are provided.',
    date: new Date('2026-11-12T19:00:00.000Z'),
    time: '07:00 PM - 10:00 PM',
    venue: 'New York Culinary Institute, NY',
    totalSeats: 30,
    availableSeats: 30,
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_booking';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events.');

    // Seed events
    await Event.insertMany(events);
    console.log('Successfully seeded events database!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
