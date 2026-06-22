import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-navbar w-full px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:scale-105 transition-transform duration-300">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Linemate <span className="text-accent-400 font-bold">Events</span>
        </span>
      </Link>

      {/* Navigation menu */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02, y: -0.5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-accent-400" />
                <span className="hidden sm:inline">My Dashboard</span>
              </motion.button>
            </Link>

            {/* Profile badge */}
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-full pl-3 pr-2 py-1.5">
              <span className="hidden md:inline text-sm font-medium text-slate-300">
                {user.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-accent-500/10">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            </div>

            {/* Sign out */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </motion.button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login">
              <span className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2">
                Sign In
              </span>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-accent-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-accent-500/20 hover:shadow-accent-500/35 transition-all"
              >
                Register
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
