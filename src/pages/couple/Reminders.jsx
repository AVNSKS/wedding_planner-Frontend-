import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import { useWedding } from '../../context/WeddingContext';
import { reminderService } from '../../services/reminders';
import { Bell, Plus, Calendar, Clock, AlertCircle, CheckCircle, Filter, Search, X, Trash2, DollarSign, Edit2 } from 'lucide-react';

const Reminders = () => {
  const { wedding, loading: weddingLoading } = useWedding();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    dateTime: '',
    type: 'custom',
    notes: ''
  });

  useEffect(() => {
    if (!weddingLoading && wedding) {
      fetchReminders();
    } else if (!weddingLoading && !wedding) {
      setLoading(false);
    }
  }, [wedding, weddingLoading]);

  const fetchReminders = async () => {
    try {
      const res = await reminderService.getReminders(wedding._id);
      setReminders(res.reminders || res || []);
    } catch (e) {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wedding) {
      showMessage('error', 'Please select a wedding first');
      return;
    }
    try {
      if (editing) {
        await reminderService.updateReminder(editing._id, formData);
        showMessage('success', 'Reminder updated!');
      } else {
        await reminderService.createReminder(formData, wedding._id);
        showMessage('success', 'Reminder created!');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ title: '', dateTime: '', type: 'custom', notes: '' });
      fetchReminders();
    } catch (e) {
      showMessage('error', 'Failed to save reminder');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await reminderService.deleteReminder(id);
      showMessage('success', 'Reminder deleted!');
      fetchReminders();
    } catch {
      showMessage('error', 'Failed to delete reminder');
    }
  };

  const filtered = reminders.filter(r => {
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading || weddingLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-rose-50 text-slate-600">
        <Header />
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-rose-100">
            <Bell className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-3 text-slate-800">No Wedding Selected</h2>
            <p className="text-slate-500 mb-6">Please select a wedding from the header to view reminders.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 text-slate-600">
      <Header />
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-rose-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-rose-500" />
              Reminders
            </h1>
            <p className="text-slate-500">Never miss tasks, payments, or events.</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditing(null); }}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-200"
          >
            <Plus className="w-5 h-5" />
            Add Reminder
          </button>
        </div>

        {/* Alert */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-500'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reminders..."
                className="w-full pl-12 pr-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full pl-12 pr-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 appearance-none"
              >
                <option value="all">All types</option>
                <option value="task">Task</option>
                <option value="payment">Payment</option>
                <option value="event">Event</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* List View (Vertical Timeline Style) */}
        <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden p-2 shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-dashed border-rose-200 m-4 rounded-xl">
              No reminders yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(r => (
                <div key={r._id} className="flex items-center gap-4 p-4 hover:bg-rose-50/50 rounded-xl transition-colors group border border-transparent hover:border-rose-100">
                  
                  {/* Icon/Type Indicator */}
                  <div className="p-3 bg-white rounded-xl border border-rose-100 text-rose-500 shadow-sm">
                    {r.type === 'payment' ? <DollarSign className="w-5 h-5"/> : 
                     r.type === 'event' ? <Calendar className="w-5 h-5"/> : 
                     <Bell className="w-5 h-5"/>}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                      {r.title}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-500 uppercase font-bold tracking-wider border border-rose-100">
                        {r.type || 'custom'}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                      {r.dateTime && (
                        <span className="flex items-center gap-1 text-rose-400">
                          <Clock className="w-3 h-3" />
                          {new Date(r.dateTime).toLocaleString()}
                        </span>
                      )}
                      {r.notes && <span className="text-slate-400 italic">— {r.notes}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditing(r);
                        setFormData({
                          title: r.title,
                          dateTime: r.dateTime ? new Date(r.dateTime).toISOString().slice(0,16) : '',
                          type: r.type || 'custom',
                          notes: r.notes || ''
                        });
                        setShowModal(true);
                      }}
                      className="p-2 bg-white text-slate-500 rounded-lg border border-rose-100 hover:bg-rose-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="p-2 bg-white text-rose-500 rounded-lg border border-rose-100 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-rose-100 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editing ? 'Edit Reminder' : 'Add Reminder'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Title</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={e => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="custom">Custom</option>
                  <option value="task">Task</option>
                  <option value="payment">Payment</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-rose-100 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditing(null); }}
                  className="flex-1 py-3 border border-rose-200 text-slate-500 font-bold rounded-xl hover:bg-rose-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                >
                  {editing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;