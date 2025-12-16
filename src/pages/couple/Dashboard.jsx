import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWedding } from '../../context/WeddingContext';
import Header from '../../components/common/Header';
import AlertModal from '../../components/ui/AlertModal';
import { weddingService } from '../../services/weddings';
import { guestService } from '../../services/guests';
import { bookingService } from '../../services/bookings';
import { budgetService } from '../../services/budgets';
import { taskService } from '../../services/tasks';
import { reminderService } from '../../services/reminders';

import { 
  Calendar, Users, DollarSign, CheckCircle, 
  MapPin, AlertTriangle, AlertCircle, Clock, Heart, ArrowRight, Bell
} from 'lucide-react';

const CoupleDashboard = () => {
  const { user } = useAuth();
  const { wedding, loading: weddingLoading } = useWedding();
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [data, setData] = useState({
    wedding: null,
    guests: { total: 0, confirmed: 0, pending: 0 },
    bookings: [],
    reminders: [],
    budgets: { totalBudget: 0, estimated: 0, actual: 0, remaining: 0, alerts: [] },
    tasks: { summary: { total: 0, completed: 0, pending: 0 }, list: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (weddingLoading) return;
        
        if (!wedding) {
          setLoading(false);
          return;
        }

        const weddingId = wedding._id;
        const results = await Promise.allSettled([
          Promise.resolve(wedding),
          guestService.getGuests(weddingId).catch(() => ({ stats: { total: 0, confirmed: 0, pending: 0 } })),
          bookingService.getMyBookings(weddingId).catch(() => ({ bookings: [] })),
          budgetService.getBudgets(weddingId).catch(() => ({ totals: { estimated: 0, actual: 0, remaining: 0 } })),
          taskService.getTasks(weddingId).catch(() => ({ summary: { total: 0, completed: 0, pending: 0 }, tasks: [] })),
          reminderService.getReminders(weddingId).catch(() => ({ reminders: [] })),
        ]);

        const [weddingRes, guestsRes, bookingsRes, budgetsRes, tasksRes, remindersRes] = results.map(r => 
          r.status === 'fulfilled' ? r.value : null
        );

        const weddingData = wedding;
        const budgetData = budgetsRes || {};
        const totalBudget = weddingData?.totalBudget || 0;
        const actualSpent = budgetData?.summary?.totalActual || 0;
        
        setData({
          wedding: weddingData,
          guests: guestsRes?.stats || { total: 0, confirmed: 0, pending: 0 },
          bookings: Array.isArray(bookingsRes?.bookings || bookingsRes) ? (bookingsRes?.bookings || bookingsRes) : [],
          reminders: remindersRes?.reminders || remindersRes || [],
          budgets: { 
            totalBudget,
            estimated: budgetData?.summary?.totalEstimated || 0,
            actual: actualSpent,
            remaining: totalBudget - actualSpent,
            isOverBudget: actualSpent > totalBudget && totalBudget > 0,
            alerts: budgetData?.alerts || []
          },
          tasks: {
            summary: tasksRes?.summary || { total: 0, completed: 0, pending: 0 },
            list: tasksRes?.tasks || [],
          },
        });
      } catch (error) {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wedding, weddingLoading]);

  // THEME CHANGE: Rose Spinner & Light Background
  if (loading || weddingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // THEME CHANGE: StatCard updated to White/Rose style
  const StatCard = ({ to, icon: Icon, title, value, subtext, alert }) => (
    <Link to={to} className="block group h-full">
      <div className={`h-full bg-white p-6 rounded-2xl border ${alert ? 'border-red-200' : 'border-rose-100'} hover:border-rose-300 shadow-sm hover:shadow-lg hover:shadow-rose-100 transition-all duration-300 relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${alert ? 'bg-red-500' : 'bg-gradient-to-r from-rose-300 to-rose-500'}`}></div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${alert ? 'bg-red-50 text-red-500' : 'bg-rose-50 border border-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors'}`}>
            <Icon className="w-6 h-6" />
          </div>
          {alert && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
        </div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-rose-500 transition-colors">{title}</h3>
        <p className={`text-3xl font-serif font-bold ${alert ? 'text-red-500' : 'text-slate-800'}`}>{value}</p>
        {subtext && (
          <div className="flex items-center gap-1 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${alert ? 'bg-red-500' : 'bg-slate-300 group-hover:bg-rose-500'}`}></div>
            <p className="text-sm text-slate-500 font-medium">{subtext}</p>
          </div>
        )}
      </div>
    </Link>
  );

  return (
    // THEME CHANGE: Main bg is rose-50, text is slate-600 (Dark Grey)
    <div className="min-h-screen bg-rose-50 text-slate-600 pb-12 font-sans">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* HERO BANNER - White Card with Soft Rose Glow */}
        {wedding ? (
          <div className="relative rounded-3xl p-8 lg:p-10 overflow-hidden text-slate-800 shadow-xl shadow-rose-100/50 bg-white border border-rose-100">
            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-rose-500 mb-3 text-sm font-bold tracking-widest uppercase">
                  <Heart className="w-4 h-4 fill-current" /> The Happy Couple
                </div>
                <h1 className="text-4xl lg:text-6xl font-serif font-bold mb-4 leading-tight text-slate-800">
                  {wedding.brideName} <span className="text-rose-400 font-serif italic mx-2">&</span> {wedding.groomName}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium text-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-400" />
                    <span className="text-slate-600">{wedding.city}, {wedding.venue}</span>
                  </div>
                  <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <div className="text-rose-400 font-serif italic text-xl tracking-wide">
                    #{wedding.hashtag || `${wedding.brideName}${wedding.groomName}`}
                  </div>
                </div>
              </div>
              
              <Link 
                to="/couple/events" 
                className="group relative bg-white hover:bg-rose-50 border border-rose-100 hover:border-rose-300 rounded-2xl p-8 text-center min-w-[220px] shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                title="View Itinerary"
              >
                <div className="text-5xl font-serif font-bold mb-2 text-slate-800 group-hover:text-rose-500 transition-colors">
                  {wedding.daysUntilWedding}
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors">
                  Days To Go
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-rose-500" />
                </div>
              </Link>
            </div>
          </div>
        ) : (
          // Empty State - Light Theme
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-rose-100">
            <h1 className="text-3xl font-serif font-bold mb-4 text-slate-800">Welcome to Your Wedding</h1>
            <p className="text-slate-500 mb-8">Begin your journey by creating your profile.</p>
            <Link to="/couple/wedding" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-200">
              Create Profile
            </Link>
          </div>
        )}

        {/* Budget Alert - Red/Rose theme */}
        {data.budgets.isOverBudget && (
          <div 
            onClick={() => setAlertModal({
              isOpen: true,
              type: 'error',
              title: '⚠️ Over Budget Alert',
              message: `You are currently ₹${Math.abs(data.budgets.remaining)?.toLocaleString()} over your planned budget of ₹${data.budgets.totalBudget?.toLocaleString()}. Please review your expenses or adjust your budget.`
            })}
            className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-4 cursor-pointer hover:bg-red-100/50 transition-all shadow-sm"
          >
            <div className="p-2 bg-white rounded-full text-red-500 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-600">Budget Attention Needed</h4>
              <p className="text-red-500/80 text-sm mt-1">
                Click to view details • <span className="font-bold text-red-600">₹{Math.abs(data.budgets.remaining)?.toLocaleString()}</span> over budget
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard to="/couple/guests" icon={Users} title="Guest List" value={`${data.guests.confirmed} / ${data.guests.total}`} subtext="Confirmed" />
          <StatCard to="/couple/budgets" icon={DollarSign} title="Total Budget" value={`₹${Math.abs(data.budgets.remaining)?.toLocaleString()}`} subtext={data.budgets.isOverBudget ? 'Over Budget' : 'Remaining'} alert={data.budgets.isOverBudget} />
          <StatCard to="/couple/tasks" icon={CheckCircle} title="Checklist" value={`${data.tasks.summary.completed} / ${data.tasks.summary.total}`} subtext="Tasks Left" />
          <StatCard to="/couple/vendors" icon={Clock} title="My Vendors" value={data.bookings.length} subtext="Services Hired" />
        </div>

        {/* Bottom Sections - 3 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Tasks Widget - White/Clean */}
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2"><CheckCircle className="w-5 h-5 text-rose-500" /> Priorities</h3>
              <Link to="/couple/tasks" className="text-xs font-bold text-rose-500 hover:text-rose-600">VIEW ALL</Link>
            </div>
            <div className="space-y-3">
              {data.tasks.list.slice(0, 3).map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <div className={`w-4 h-4 rounded-full border ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}></div>
                  <span className={`text-sm flex-1 ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</span>
                </div>
              ))}
              {data.tasks.list.length === 0 && <p className="text-slate-400 text-sm italic">No active tasks.</p>}
            </div>
          </div>

          {/* 2. Reminders Widget - White/Clean */}
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2"><Bell className="w-5 h-5 text-rose-500" /> Reminders</h3>
              <Link to="/couple/reminders" className="text-xs font-bold text-rose-500 hover:text-rose-600">VIEW ALL</Link>
            </div>
            <div className="space-y-3">
              {data.reminders.slice(0, 3).map((rem) => (
                <div key={rem._id} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <div className="p-2 bg-white rounded-lg text-rose-500 shadow-sm"><Clock className="w-3 h-3" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{rem.title}</p>
                    <p className="text-xs text-slate-500">{rem.dateTime ? new Date(rem.dateTime).toLocaleDateString() : 'No date'}</p>
                  </div>
                </div>
              ))}
              {data.reminders.length === 0 && <p className="text-slate-400 text-sm italic">No upcoming reminders.</p>}
            </div>
          </div>

          {/* 3. Bookings Widget - White/Clean */}
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2"><Clock className="w-5 h-5 text-rose-500" /> Recent</h3>
              <Link to="/couple/vendors" className="text-xs font-bold text-rose-500 hover:text-rose-600">VIEW ALL</Link>
            </div>
            <div className="space-y-3">
              {data.bookings.slice(0, 3).map((b) => (
                <div key={b._id} className="flex justify-between items-center p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{b.vendor?.businessName || b.vendorName || 'Unnamed Vendor'}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500">{b.serviceType}</p>
                    {b.totalAmount > 0 && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">₹{b.totalAmount?.toLocaleString()}</p>
                    )}
                  </div>
                  {/* Status Pills: Lighter backgrounds */}
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase whitespace-nowrap ${
                    b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 
                    b.status === 'cancelled' ? 'bg-red-100 text-red-500' : 
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
              {data.bookings.length === 0 && <p className="text-slate-400 text-sm italic">No bookings found.</p>}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="View Budget"
        onConfirm={() => window.location.href = '/couple/budgets'}
      />
    </div>
  );
};

export default CoupleDashboard;