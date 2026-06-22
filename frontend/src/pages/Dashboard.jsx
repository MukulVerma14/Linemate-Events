import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { Calendar, MapPin, Ticket, Ban, ChevronRight, UserCheck, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [seatsToCancel, setSeatsToCancel] = useState(1);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setSeatsToCancel(1); // default to cancelling 1 ticket
    setModalOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setCancellingId(selectedBooking._id);
    try {
      const response = await api.patch(`/bookings/${selectedBooking._id}/cancel`, { seatsToCancel });
      toast.success(response.data.message || `Successfully released ${seatsToCancel} seats.`);
      
      // Instantly refetch all bookings data so dashboard counts stay in absolute sync
      await fetchBookings();
      
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to cancel seats';
      toast.error(msg);
    } finally {
      setCancellingId(null);
      setSelectedBooking(null);
    }
  };

  // Analytics helper calculations
  const activeBookings = bookings.filter(b => b.status === 'Active');
  const totalTicketsBooked = activeBookings.reduce((sum, b) => sum + b.seatsBooked, 0);
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Background glow decorator */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-accent-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        
        {/* Welcome message header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your ticket reservations, print confirmations, and monitor event details.
            </p>
          </div>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4.5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-semibold text-sm shadow-lg shadow-accent-600/15 transition-all"
            >
              Browse Events
            </motion.button>
          </Link>
        </div>

        {loading ? (
          // Spinner Loader
          <div className="flex justify-center items-center py-20">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-accent-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-accent-500 animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Overview statistics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <div className="glass-card rounded-2xl p-5 border border-slate-800/50 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bookings</span>
                <span className="text-3xl font-extrabold text-white mt-2 tabular-nums">{activeBookings.length}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-slate-800/50 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seats Reserved</span>
                <span className="text-3xl font-extrabold text-accent-400 mt-2 tabular-nums">{totalTicketsBooked}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-slate-800/50 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancelled Bookings</span>
                <span className="text-3xl font-extrabold text-slate-400 mt-2 tabular-nums">{cancelledBookings.length}</span>
              </div>
            </div>

            {/* List Header */}
            <h2 className="text-lg font-bold text-white mb-5">Your Registered Tickets</h2>

            {bookings.length > 0 ? (
              // Tickets list
              <div className="space-y-4">
                {bookings.map((booking, index) => {
                  const eventDate = new Date(booking.event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const isActive = booking.status === 'Active';

                  return (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass-card rounded-2xl border border-slate-850 overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative">
                        {/* Perforated ticket decoration for visual aesthetic */}
                        <div className="hidden md:block absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-950 rounded-r-full border-r border-slate-850" />
                        <div className="hidden md:block absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-950 rounded-l-full border-l border-slate-850" />

                        {/* Event title & badge info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span 
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                isActive 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                              }`}
                            >
                              {booking.status}
                            </span>
                            <span className="text-xs text-slate-500 tabular-nums">
                              ID: #{booking._id.substring(booking._id.length - 8).toUpperCase()}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-white leading-tight">
                            {booking.event.name}
                          </h3>

                          {/* Event Meta Details */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {eventDate} ({booking.event.time})
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              {booking.event.venue}
                            </span>
                          </div>
                        </div>

                        {/* Booking quantity indicators */}
                        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t border-slate-850 md:border-t-0">
                          <div className="flex flex-col text-left md:text-right">
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Quantity</span>
                            <span className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5 md:justify-end">
                              <Ticket className="w-4 h-4 text-accent-500" />
                              {booking.seatsBooked} {booking.seatsBooked === 1 ? 'Seat' : 'Seats'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openCancelModal(booking)}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/25 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Cancel Ticket
                              </motion.button>
                            ) : (
                              <span className="text-xs text-slate-600 font-medium px-3.5 py-2 bg-slate-900 border border-slate-850/60 rounded-xl cursor-default flex items-center gap-1.5">
                                <Ban className="w-3.5 h-3.5" />
                                Ticket Cancelled
                              </span>
                            )}
                            <Link to={`/events/${booking.event._id}`}>
                              <button className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // Empty Bookings list state
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/10 backdrop-blur-sm max-w-md mx-auto"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No Tickets Booked Yet</h3>
                <p className="text-slate-400 mt-2 max-w-sm text-sm px-4 leading-relaxed">
                  Your ticket bookings list is empty. Explore our premium catalog to secure seats to upcoming summits and workshops!
                </p>
                <Link to="/" className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4.5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-semibold text-xs shadow-lg shadow-accent-600/10 transition-all"
                  >
                    Find Events
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Confirmation modal for cancellation */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelBooking}
        title="Modify Booking"
        message={`Select how many seats you would like to cancel for your booking to "${selectedBooking?.event?.name}".`}
        isLoading={cancellingId !== null}
        maxSeats={selectedBooking?.seatsBooked}
        seatsToCancel={seatsToCancel}
        setSeatsToCancel={setSeatsToCancel}
      />
    </div>
  );
};

export default Dashboard;
