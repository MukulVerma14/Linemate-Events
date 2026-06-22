# Linemate Events - Event Booking System

A premium, full-stack event booking system built to demonstrate production-quality architecture, security, concurrency handling, and an immersive user experience.

---

## 🌟 Key Features

- **Responsive Catalog**: Interactive list of upcoming events with real-time seats progress indicators.
- **Seat Booking with Atomic Updates**: Prevents seat-booking race conditions during high concurrent traffic without relying on complex, replica-set-exclusive MongoDB transactions.
- **Premium SaaS UX/UI**: Powered by Vite + React, styled using a sleek glassmorphism dark-mode palette, and animated with Framer Motion transitions.
- **Robust JWT Authentication**: Implements token-based authorization with client-side state hooks (`AuthContext`).
- **Interactive User Dashboard**: Displays analytical summaries, active tickets, cancelled tickets, and a confirmation modal for ticket cancellations.

---

## 💻 Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Lucide React, Axios, React Hot Toast.
- **Backend**: Node.js, Express.js, Cors, Dotenv.
- **Database**: MongoDB with Mongoose ODM.
- **Security**: JSON Web Tokens (JWT) for route protection, `bcryptjs` for secure password hashing.

---

## ⚙️ Environment Variables

### Backend Configurations

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Port
PORT=5000

# MongoDB Connection String (defaults to localhost)
MONGO_URI=your_mongose_db_link

# Secret key used for signing JWT tokens
JWT_SECRET=your_token_key

# Environment mode
NODE_ENV=development
```

---

## 🚀 Local Project Setup

Follow these steps to run both the backend and frontend servers locally.

### Prerequisites
- Node.js (v20.17.0+ recommended)
- Local MongoDB instance or MongoDB Atlas URI

### Step 1: Database Seeding
Open a terminal in the project root directory and seed the database with initial event records:
```bash
cd backend
npm run seed
```
*This will wipe existing mock events and populate 5 custom events (Tech Innovators Summit, Global Music Festival, React Masterclass, etc.) so that the UI looks populated immediately.*

### Step 2: Start the Backend Server
Start the Express server on port `5000`:
```bash
npm run dev
```

### Step 3: Start the Frontend Application
Open a new terminal window in the project root directory:
```bash
cd frontend
npm install
npm run dev
```
*The React app will be served at `http://localhost:5173/`.*

---

## 📖 API Documentation

All API endpoints are prefixed with `/api`.

### 1. Authentication Routes
- **`POST /api/auth/register`** (Public)
  - Registers a new user.
  - **Body**: `{ "name": "...", "email": "...", "password": "..." }`
  - **Response (201)**: Returns user info and signed JWT `token`.
- **`POST /api/auth/login`** (Public)
  - Authenticates user credentials.
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Response (200)**: Returns user info and signed JWT `token`.

### 2. Events Routes
- **`GET /api/events`** (Public)
  - Lists all upcoming events sorted by date.
- **`GET /api/events/:id`** (Public)
  - Fetches details of a specific event.

### 3. Bookings Routes (Requires JWT Authorization)
All calls must include the header `Authorization: Bearer <token>`.
- **`POST /api/bookings`** (Private)
  - Books seats for an event. Atomically decrements event available seats.
  - **Body**: `{ "eventId": "...", "seatsBooked": 2 }`
  - **Response (201)**: Confirms booking status.
- **`GET /api/bookings`** (Private)
  - Lists all bookings belonging to the authenticated user, populated with event details.
- **`PATCH /api/bookings/:id/cancel`** (Private)
  - Partially cancels a booking by releasing a granular number of seats. Subtracts seats from the booking and adds them back to the event inventory. If booking seats reach 0, booking status updates to `'Cancelled'`.
  - **Body**: `{ "seatsToCancel": 2 }`
  - **Response (200)**: Returns confirmation and the updated booking.
- **`DELETE /api/bookings/:id`** (Private)
  - Cancels an entire booking, updates its status to `'Cancelled'`, and returns all seats back to the event.

---

## 🧠 Assumptions Made

- **Historical Logging:** Cancelled bookings are not permanently deleted from the database. Instead, their status is updated to `Cancelled` to maintain historical logs for user dashboards and potential future auditing.
- **Event Expiration:** Users are currently allowed to view all events, but the system assumes frontend date-filtering (or backend cron jobs) would eventually be implemented to archive past events.
- **Seat Availability:** If a user requests more seats than available, the backend rejects the entire request rather than fulfilling a partial request.

---

## 🎨 Design & Architecture Decisions

1. **Atomic Concurrency Handling**:
   To prevent double-booking or seat oversubscription when multiple users concurrently request tickets, the application performs updates using MongoDB's atomic `findOneAndUpdate` filter:
   ```javascript
   Event.findOneAndUpdate(
     { _id: eventId, availableSeats: { $gte: seatsBooked } },
     { $inc: { availableSeats: -seatsBooked } }
   )
   ```
   If the update returns `null`, the transaction is blocked. This avoids heavy MongoDB replica-set transaction overhead while remaining 100% race-condition proof.

2. **React Context & State Management**:
   Session persistence is managed via `AuthContext.jsx`. The application syncs the JWT token to `localStorage` and interceptors inject the credentials on every outbound request, maintaining high security and modularity.

3. **Vibrant Dark-Theme Aesthetic**:
   Avoids simple layouts by incorporating custom backdrop blur styles, deep slate/violet color hierarchies, custom rounded boundaries, and animated transitions using Framer Motion.

4. **Robust Error Handling & Validation:**
   All backend routes use strict input validation. If a user attempts to book more tickets than the inventory holds, the server gracefully intercepts the request and responds with a `400 Bad Request` and a meaningful error message, which the frontend catches to display a localized error toast.   
