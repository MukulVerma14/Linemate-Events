import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Ticket, ChevronLeft, Plus, Minus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Event not found or database disconnect');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-accent-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isSoldOut = event.availableSeats === 0;
  const bookedCount = event.totalSeats - event.availableSeats;
  const bookedPercent = (bookedCount / event.totalSeats) * 100;

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book seats');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.post('/bookings', {
        eventId: event._id,
        seatsBooked: seats,
      });

      toast.success(response.data.message || 'Seats booked successfully!');
      
      // Update local state available seats
      setEvent((prev) => ({
        ...prev,
        availableSeats: prev.availableSeats - seats,
      }));
      setSeats(1);
      
      // Redirect to dashboard to see booking
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error occurred during booking';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const incrementSeats = () => {
    if (seats < event.availableSeats) {
      setSeats((prev) => prev + 1);
    } else {
      toast.error(`Only ${event.availableSeats} seats available.`);
    }
  };

  const decrementSeats = () => {
    if (seats > 1) {
      setSeats((prev) => prev - 1);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Decorative gradient blur backdrop */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Back navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Catalog
        </Link>

        {/* Layout split grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Main Info Columns (Left - occupies 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Visual banner card */}
            <div className="h-64 sm:h-80 w-full rounded-3xl bg-gradient-to-br from-accent-900/60 via-indigo-950/45 to-slate-900 border border-slate-800 flex items-center justify-center p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-500/10 via-transparent to-transparent" />
              <div className="text-center relative z-10 space-y-4">
                <Ticket className="w-16 h-16 text-accent-400 mx-auto drop-shadow-[0_0_10px_rgba(139,92,246,0.3)] animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {event.name}
                </h2>
              </div>
            </div>

            {/* Event Description Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">About this Event</h3>
                <p className="mt-3 text-slate-400 leading-relaxed text-sm sm:text-base font-normal">
                  {event.description}
                </p>
              </div>

              {/* Event Metadata grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800/80">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-accent-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date & Time</h4>
                    <p className="mt-1 text-sm font-medium text-slate-200">{formattedDate}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-accent-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Location Venue</h4>
                    <p className="mt-1 text-sm font-medium text-slate-200">{event.venue}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Booking Widgets Panel (Right - occupies 1 col) */}
          <div className="lg:sticky lg:top-24 space-y-6">
            
            {/* Booking Actions Checkout */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-500 via-indigo-500 to-accent-600" />
              
              <h3 className="text-lg font-bold text-white mb-2">Book Tickets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure your seats instantly. Tickets will be saved directly in your dashboard.
              </p>

              {/* Progress bar info */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Seats Availability</span>
                  <span className="font-bold text-slate-200">
                    {isSoldOut ? 'Sold Out' : `${event.availableSeats} of ${event.totalSeats} seats remaining`}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isSoldOut ? 'bg-rose-500' : 'bg-gradient-to-r from-accent-500 to-indigo-500'}`} 
                    style={{ width: `${bookedPercent}%` }}
                  />
                </div>
              </div>

              {isSoldOut ? (
                // Sold Out message
                <div className="mt-8 flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-semibold leading-relaxed">
                    Booking closed. This event has run out of ticket stock.
                  </span>
                </div>
              ) : (
                <>
                  {/* Selector panel */}
                  <div className="mt-8 pt-6 border-t border-slate-850">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                      Select Tickets Quantity
                    </label>
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-2xl p-2.5">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={decrementSeats}
                        disabled={seats <= 1 || bookingLoading}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      
                      <span className="text-lg font-bold text-white tabular-nums">{seats}</span>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={incrementSeats}
                        disabled={seats >= event.availableSeats || bookingLoading}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-400">Selected Quantity</span>
                    <span className="text-white bg-slate-900 border border-slate-800/80 px-3 py-1 rounded-xl">
                      {seats} {seats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>

                  {/* Booking Trigger */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full mt-8 py-3.5 rounded-2xl bg-gradient-to-r from-accent-600 to-indigo-650 text-white font-bold text-sm shadow-xl shadow-accent-500/10 hover:shadow-accent-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-4.5 h-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Reserving Ticket...
                      </>
                    ) : user ? (
                      'Reserve Spot Now'
                    ) : (
                      'Sign In to Book'
                    )}
                  </motion.button>
                </>
              )}
            </div>

            {/* Premium Guarantee card */}
            <div className="p-4.5 rounded-2xl bg-slate-900/40 border border-slate-850 text-slate-500 flex items-center gap-3">
              <Ticket className="w-5 h-5 text-accent-500/60 shrink-0" />
              <span className="text-[11px] leading-relaxed font-medium">
                Each reservation includes immediate digital registration details. Spot transfers are accessible under dashboard routes.
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
