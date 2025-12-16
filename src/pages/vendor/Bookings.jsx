import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import { bookingService } from '../../services/bookings';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Calendar, Clock, Filter, Search } from 'lucide-react';

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, status: null });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getVendorBookings();
      const list = Array.isArray(res.bookings || res) ? (res.bookings || res) : [];
      setBookings(list);
    } catch (error) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleStatusUpdate = (id, status) => {
    setConfirmModal({ show: true, id, status });
  };

  const proceedStatusUpdate = async () => {
    const { id, status } = confirmModal;
    setConfirmModal({ show: false, id: null, status: null });

    try {
      await bookingService.updateStatus(id, status);
      showMessage('success', `Booking ${status} successfully`);
      fetchBookings();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative selection:bg-teal-100">
      <Header />
      
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-teal-400/10 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[100px] mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex justify-between items-end pb-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Bookings</h1>
            <p className="text-slate-500 text-lg">Manage incoming requests and confirmed events.</p>
          </div>
          <div className="flex gap-3">
             {/* Fake Search Bar for aesthetics */}
             <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <Search className="w-4 h-4 text-slate-400"/>
                <input placeholder="Search client..." className="bg-transparent border-none focus:outline-none text-sm w-48"/>
             </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 border mb-6 ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BENTO TABLE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="p-6">Client Details</th>
                  <th className="p-6">Event Info</th>
                  <th className="p-6">Financials</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center text-slate-400 italic">
                      No bookings found. Time to update your portfolio!
                    </td>
                  </tr>
                ) : (
                  bookings.map((b, i) => (
                    <motion.tr 
                      key={b._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-inner">
                              {b.coupleName ? b.coupleName.charAt(0) : 'C'}
                           </div>
                           <div>
                              <p className="font-bold text-slate-900">{b.coupleName || 'Client Request'}</p>
                              <p className="text-xs text-slate-400 uppercase tracking-wider">{b.serviceType}</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-600">
                           <Calendar className="w-4 h-4 text-teal-500"/>
                           <span className="font-medium text-sm">
                              {b.eventDate ? new Date(b.eventDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
                           </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                           ₹{b.totalAmount?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                            b.status === 'confirmed' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 
                            b.status === 'pending' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 
                            'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {b.status === 'confirmed' && <CheckCircle className="w-3 h-3"/>}
                          {b.status === 'pending' && <Clock className="w-3 h-3"/>}
                          {b.status}
                        </span>
                      </td>
                      <td className="p-6">
                        {b.status === 'pending' ? (
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                              className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors"
                              title="Accept"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusUpdate(b._id, 'rejected')}
                              className="p-2 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </motion.button>
                          </div>
                        ) : (
                           <span className="text-xs text-slate-400 italic">No actions</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-8 text-center"
            >
              <div className={`inline-flex p-4 rounded-full mb-6 shadow-inner ${confirmModal.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {confirmModal.status === 'confirmed' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {confirmModal.status === 'confirmed' ? 'Accept Request?' : 'Reject Request?'}
              </h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Are you sure you want to {confirmModal.status === 'confirmed' ? 'confirm' : 'decline'} this booking? This will notify the client immediately.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal({ show: false, id: null, status: null })}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedStatusUpdate}
                  className={`flex-1 py-3 font-bold rounded-xl text-white shadow-lg transition-transform hover:-translate-y-1 ${
                    confirmModal.status === 'confirmed' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorBookings;