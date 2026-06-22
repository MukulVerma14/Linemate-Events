import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Plus, Minus } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isLoading,
  maxSeats, 
  seatsToCancel, 
  setSeatsToCancel 
}) => {
  if (!isOpen) return null;

  const isModifyFlow = maxSeats !== undefined && seatsToCancel !== undefined && setSeatsToCancel !== undefined;

  const incrementSeats = () => {
    if (seatsToCancel < maxSeats) {
      setSeatsToCancel(prev => prev + 1);
    }
  };

  const decrementSeats = () => {
    if (seatsToCancel > 1) {
      setSeatsToCancel(prev => prev - 1);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (!isModifyFlow) return 'Yes, Cancel Booking';
    return seatsToCancel === maxSeats ? 'Cancel Entire Booking' : `Cancel ${seatsToCancel} Seats`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal structure */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/80 p-6 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>

          <p className="mt-3.5 text-sm text-slate-400 leading-relaxed">
            {message}
          </p>

          {/* Interactive seat modification panel */}
          {isModifyFlow && (
            <div className="mt-5 pt-4 border-t border-slate-800/60">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Specify Quantity to Cancel
              </label>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  disabled={seatsToCancel <= 1 || isLoading}
                  onClick={decrementSeats}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>

                <div className="text-center">
                  <span className="text-base font-bold text-white tabular-nums">{seatsToCancel}</span>
                  <span className="text-[10px] text-slate-500 block">of {maxSeats} reserved seats</span>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  disabled={seatsToCancel >= maxSeats || isLoading}
                  onClick={incrementSeats}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
              {getButtonText()}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
