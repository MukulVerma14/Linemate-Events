import { useEffect, useState } from 'react';
import api from '../services/api';
import Hero from '../components/Hero';
import EventCard from '../components/EventCard';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase();
    return (
      event.name.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen mesh-gradient pb-20">
      {/* Search and Welcome Header */}
      <Hero search={search} setSearch={setSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-2">
        {loading ? (
          // Loading skeleton state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card rounded-2xl p-6 h-[340px] animate-pulse flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-slate-800 rounded-lg w-1/4"></div>
                    <div className="h-5 bg-slate-800 rounded-lg w-1/5"></div>
                  </div>
                  <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
                <div className="space-y-3 pt-6 border-t border-slate-800">
                  <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-2.5 bg-slate-800 rounded w-full"></div>
                  <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          // Loaded cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        ) : (
          // Empty search results
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 backdrop-blur-sm max-w-lg mx-auto"
          >
            <AlertCircle className="w-12 h-12 text-slate-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-white">No Events Found</h3>
            <p className="text-slate-400 mt-1.5 max-w-sm text-sm px-4">
              We couldn't find any events matching "{search}". Try adjusting your keywords.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Home;
