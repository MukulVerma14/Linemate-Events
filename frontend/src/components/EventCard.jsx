import { Calendar as CalendarIcon, MapPin, UserCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EventCard = ({ event, index }) => {
  const { _id, name, description, date, time, venue, totalSeats, availableSeats } = event;

  const seatsBooked = totalSeats - availableSeats;
  const fillPercentage = (seatsBooked / totalSeats) * 100;
  
  const eventDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isSoldOut = availableSeats === 0;
  const isFillingFast = !isSoldOut && (availableSeats <= 15 || fillPercentage >= 80);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between h-full group card-hover-border transition-all duration-300 hover:shadow-2xl hover:shadow-accent-500/5 relative overflow-hidden"
    >
      <div>
        {/* Dynamic status badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-accent-400 bg-accent-500/10 px-2.5 py-1 rounded-lg">
            {time.split(' ')[0]} {time.split(' ')[1] || 'Event'}
          </span>
          {isSoldOut ? (
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Sold Out
            </span>
          ) : isFillingFast ? (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">
              Filling Fast
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Available
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className="text-xl font-bold text-white group-hover:text-accent-400 transition-colors duration-200 line-clamp-1">
          {name}
        </h3>
        <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Event details block */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{venue}</span>
          </div>
        </div>
      </div>

      {/* Seat availability progress meter */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <UserCheck className="w-3.5 h-3.5" />
            {isSoldOut ? 'Capacity Full' : `${availableSeats} seats left`}
          </span>
          <span className="text-slate-300 font-bold">{Math.round(fillPercentage)}% Booked</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isSoldOut 
                ? 'bg-rose-500' 
                : isFillingFast 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : 'bg-gradient-to-r from-accent-500 to-indigo-500'
            }`}
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>

        {/* Action button */}
        <Link to={`/events/${_id}`} className="block mt-5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isSoldOut
                ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-accent-600/10 text-slate-200 hover:text-white border border-slate-800 hover:border-accent-500/35'
            }`}
            disabled={isSoldOut}
          >
            <span>{isSoldOut ? 'Sold Out' : 'Get Tickets'}</span>
            {!isSoldOut && <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;
