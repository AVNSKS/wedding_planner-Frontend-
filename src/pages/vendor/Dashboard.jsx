import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import { bookingService } from '../../services/bookings';
import { motion } from 'framer-motion'; // THE SECRET SAUCE
import { 
  Calendar, DollarSign, CheckCircle, Clock, 
  TrendingUp, ArrowUpRight, Briefcase, ChevronRight, Zap
} from 'lucide-react';

// --- ANIMATION VARIANTS (Physics-based) ---
const containerVar = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger effect
      delayChildren: 0.2,
    },
  },
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } },
};

// --- SPOTLIGHT CARD COMPONENT (React Bits Style) ---
const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setOpacity(1);
  };

  const handleBlur = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg ${className}`}
      variants={itemVar} // Use animation variants
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(13, 148, 136, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
};

const VendorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bookingService.getVendorBookings();
        const list = Array.isArray(res.bookings || res) ? (res.bookings || res) : [];
        setBookings(list);
        
        const confirmedList = list.filter(b => b.status === 'confirmed');
        const revenue = confirmedList.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        setStats({
          total: list.length,
          confirmed: confirmedList.length,
          pending: list.filter(b => b.status === 'pending').length,
          revenue
        });
      } catch (error) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      
      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
              Vendor<span className="text-teal-600">Pro</span> Dashboard
            </h1>
            <p className="text-slate-500 text-lg">
              Real-time insights for your wedding business.
            </p>
          </div>
          <div className="flex gap-3">
             <Link to="/vendor/bookings">
               <motion.button 
                 whileHover={{ scale: 1.05 }} 
                 whileTap={{ scale: 0.95 }}
                 className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:border-teal-500 hover:text-teal-600 transition-colors"
               >
                  <Calendar className="w-4 h-4"/> Schedule
               </motion.button>
             </Link>
             <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-black font-bold rounded-xl shadow-lg hover:bg-teal-600 transition-colors"
             >
                <Zap className="w-4 h-4"/> Quick Actions
             </motion.button>
          </div>
        </motion.div>

        {/* KPI STATS GRID - STAGGERED ANIMATION */}
        <motion.div 
          variants={containerVar}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Revenue Card */}
          <SpotlightCard className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Revenue</p>
                <motion.h3 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-3xl font-bold text-slate-800"
                >
                  ₹{stats.revenue.toLocaleString()}
                </motion.h3>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-teal-100 text-teal-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>

          {/* Active Bookings */}
          <SpotlightCard className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Confirmed</p>
                <h3 className="text-3xl font-bold text-slate-800">{stats.confirmed}</h3>
                <p className="text-xs text-slate-400 mt-2">Active projects</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>

          {/* Pending */}
          <SpotlightCard className="p-6 border-l-4 border-l-amber-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Pending</p>
                <h3 className="text-3xl font-bold text-slate-800">{stats.pending}</h3>
                <p className="text-xs text-amber-600 font-bold mt-2">Needs Action</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>

          {/* Total Leads */}
          <SpotlightCard className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Leads</p>
                <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
                <p className="text-xs text-slate-400 mt-2">Lifetime inquiries</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Recent Activity Table */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" /> Recent Inquiries
              </h3>
              <Link to="/vendor/bookings" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </Link>
            </div>
            
            <div className="p-0">
              {bookings.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Briefcase className="w-8 h-8 text-slate-300"/>
                  </div>
                  <p className="text-slate-400 font-medium">No activity yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bookings.slice(0, 5).map((b, index) => (
                    <motion.div 
                      key={b._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md ${
                          b.status === 'confirmed' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                          b.status === 'pending' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                          'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}>
                          {b.coupleName ? b.coupleName.charAt(0) : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                            {b.coupleName || 'Client Request'}
                          </p>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {b.serviceType} • {b.eventDate ? new Date(b.eventDate).toLocaleDateString() : 'Date TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize shadow-sm ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Quick Tips */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
             <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-2xl">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-400"/> Pro Tip
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Updating your portfolio images increases booking rates by <span className="text-teal-400 font-bold">25%</span>.
                  </p>
                  <Link to="/vendor/profile">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-center font-bold rounded-xl transition-colors shadow-lg shadow-teal-900/50"
                    >
                      Update Portfolio
                    </motion.button>
                  </Link>
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;