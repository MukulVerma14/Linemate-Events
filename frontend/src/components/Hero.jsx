import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ search, setSearch }) => {
  return (
    <div className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-accent-500/10 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none"></div>

      {/* Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-accent-300 bg-accent-500/10 border border-accent-500/25 mb-6 inline-block uppercase">
          ✦ Premium Booking Hub
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] text-white"
      >
        Secure Your Tickets to{' '}
        <span className="bg-gradient-to-r from-accent-400 via-indigo-300 to-accent-600 bg-clip-text text-transparent">
          Remarkable Events
        </span>
      </motion.h1>

      {/* Paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 text-base md:text-lg text-slate-400 max-w-xl font-normal leading-relaxed"
      >
        Access live concerts, tech summits, green tech exhibitions, and gourmet masterclasses. Instantly book your spot with zero overbooking risk.
      </motion.p>

      {/* Interactive Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-10 w-full max-w-md"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-accent-500 to-indigo-500 opacity-20 blur group-hover:opacity-30 transition-all duration-300"></div>
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1">
            <Search className="w-5 h-5 text-slate-400 ml-3.5" />
            <input
              type="text"
              placeholder="Search events, venues, or dates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-sm text-slate-200 placeholder-slate-500 py-3 px-3 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
