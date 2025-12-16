import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import { useWedding } from '../../context/WeddingContext';
import { eventsService } from '../../services/events';
import { weddingService } from '../../services/weddings';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Plus, Edit2, Trash2,
  AlertCircle, CheckCircle, Heart, DollarSign, Palette, X
} from 'lucide-react';

const Events = () => {
  const navigate = useNavigate();
  const { wedding, loading: weddingLoading } = useWedding();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWeddingModal, setShowWeddingModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '', date: '', startTime: '', endTime: '', venue: '', address: '', notes: '',
  });

  const [weddingForm, setWeddingForm] = useState({
    brideName: '', groomName: '', weddingDate: '', venue: '', city: '', totalBudget: '', theme: '', notes: '',
  });

  useEffect(() => {
    if (!weddingLoading && wedding) {
      fetchData();
    } else if (!weddingLoading && !wedding) {
      setLoading(false);
    }
  }, [wedding, weddingLoading]);

  const fetchData = async () => {
    if (!wedding) return;
    try {
      setLoading(true);
      const eventsRes = await eventsService.getEvents(wedding._id);
      setEvents(eventsRes?.events || eventsRes || []);
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditWedding = () => {
    if (wedding) {
      setWeddingForm({
        brideName: wedding.brideName || '',
        groomName: wedding.groomName || '',
        weddingDate: wedding.weddingDate ? new Date(wedding.weddingDate).toISOString().split('T')[0] : '',
        venue: wedding.venue || '',
        city: wedding.city || '',
        totalBudget: wedding.totalBudget || '',
        theme: wedding.theme || '',
        notes: wedding.notes || '',
      });
      setShowWeddingModal(true);
    }
  };

  const handleWeddingSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...weddingForm, totalBudget: Number(weddingForm.totalBudget) || 0 };
      await weddingService.updateWedding(wedding._id, payload);
      showMessage('success', 'Wedding details updated successfully');
      setShowWeddingModal(false);
      fetchData();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update wedding details');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', startTime: '', endTime: '', venue: '', address: '', notes: '' });
    setEditing(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wedding) { showMessage('error', 'Please select a wedding first'); return; }
    try {
      if (editing) {
        await eventsService.updateEvent(editing._id, formData);
        showMessage('success', 'Event updated');
      } else {
        await eventsService.createEvent(formData, wedding._id);
        showMessage('success', 'Event created');
      }
      resetForm();
      fetchData(); 
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsService.deleteEvent(id);
      showMessage('success', 'Event deleted');
      fetchData(); 
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to delete event');
    }
  };

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
            <Calendar className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-3 text-slate-800">No Wedding Selected</h2>
            <p className="text-slate-500 mb-6">Please select a wedding from the header to manage events.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 text-slate-600">
      <Header />
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-rose-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">Wedding & Events</h1>
            <p className="text-slate-500">Manage your wedding details and all ceremonies</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-200"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-500'
            }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Wedding Details Section */}
        {wedding ? (
          <div className="bg-white rounded-2xl border border-rose-100 p-8 shadow-sm relative overflow-hidden">
             {/* Decorative Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-400"></div>
            
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-serif">
                 Wedding Details
              </h2>
              <button onClick={handleEditWedding} className="flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Couple</p>
                  <p className="text-lg font-serif text-slate-800">{wedding.brideName} & {wedding.groomName}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Wedding Date</p>
                  <p className="text-lg text-slate-800">
                    {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Venue</p>
                  <p className="text-lg text-slate-800">{wedding.venue || 'Not set'}</p>
                  <p className="text-sm text-slate-500">{wedding.city}</p>
                </div>
              </div>
              {wedding.totalBudget > 0 && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Budget</p>
                    <p className="text-lg text-slate-800">₹{wedding.totalBudget.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {wedding.theme && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Theme</p>
                    <p className="text-lg text-slate-800">{wedding.theme}</p>
                  </div>
                </div>
              )}
            </div>
            {wedding.notes && (
              <div className="mt-6 p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                <p className="text-xs font-bold uppercase text-slate-400 mb-2">Notes</p>
                <p className="text-sm text-slate-600">{wedding.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
            <p className="mb-4 text-slate-400">No wedding details found</p>
            <button onClick={() => navigate('/couple/wedding')} className="text-rose-500 font-bold hover:underline">
              Create Wedding Profile →
            </button>
          </div>
        )}

        {/* Events List */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6">Ceremonies & Events</h2>
          
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl border border-rose-200 border-dashed p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-rose-200" />
              <p className="text-slate-400">No events yet. Add your first ceremony or function.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-white rounded-2xl border border-rose-100 p-6 hover:border-rose-300 transition-all hover:shadow-lg relative group shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif font-bold text-slate-800 pr-8">{event.name}</h3>
                    
                    {/* Date Badge */}
                    {event.date && (
                        <div className="text-center bg-rose-50 rounded-lg p-2 min-w-[60px] border border-rose-100">
                            <div className="text-xs uppercase text-rose-400 font-bold">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-xl font-serif font-bold text-slate-700">
                            {new Date(event.date).getDate()}
                            </div>
                        </div>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-slate-500 mb-6">
                    {(event.startTime || event.endTime) && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-rose-400" />
                        <span>{event.startTime} {event.endTime && `- ${event.endTime}`}</span>
                      </div>
                    )}
                    {(event.venue || event.address) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-rose-400 mt-1" />
                        <span>{event.venue}{event.address && `, ${event.address}`}</span>
                      </div>
                    )}
                    {event.notes && (
                      <div className="mt-2 p-3 rounded-lg bg-rose-50/50 border border-rose-100 italic text-slate-500">
                        "{event.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 border-t border-rose-50 pt-4">
                    <button
                      onClick={() => {
                        setEditing(event);
                        setFormData({
                          name: event.name || '',
                          date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
                          startTime: event.startTime || '', endTime: event.endTime || '',
                          venue: event.venue || '', address: event.address || '', notes: event.notes || '',
                        });
                        setShowModal(true);
                      }}
                      className="flex-1 py-2 rounded-lg text-sm font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex-1 py-2 rounded-lg text-sm font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wedding Edit Modal */}
      {showWeddingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-rose-100 shadow-2xl">
            <div className="p-6 border-b border-rose-100 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-slate-800">Edit Wedding Details</h2>
              <button onClick={() => setShowWeddingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleWeddingSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bride Name *</label>
                  <input value={weddingForm.brideName} onChange={(e) => setWeddingForm({ ...weddingForm, brideName: e.target.value })} required className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Groom Name *</label>
                  <input value={weddingForm.groomName} onChange={(e) => setWeddingForm({ ...weddingForm, groomName: e.target.value })} required className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Wedding Date *</label>
                <input type="date" value={weddingForm.weddingDate} onChange={(e) => setWeddingForm({ ...weddingForm, weddingDate: e.target.value })} required className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Venue</label>
                  <input value={weddingForm.venue} onChange={(e) => setWeddingForm({ ...weddingForm, venue: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Venue name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">City</label>
                  <input value={weddingForm.city} onChange={(e) => setWeddingForm({ ...weddingForm, city: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="City" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Budget (₹)</label>
                  <input type="number" value={weddingForm.totalBudget} onChange={(e) => setWeddingForm({ ...weddingForm, totalBudget: e.target.value })} min="0" className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Theme</label>
                  <input value={weddingForm.theme} onChange={(e) => setWeddingForm({ ...weddingForm, theme: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="e.g., Traditional" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Notes</label>
                <textarea rows={3} value={weddingForm.notes} onChange={(e) => setWeddingForm({ ...weddingForm, notes: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
              </div>

              <div className="flex gap-4 pt-4 border-t border-rose-100">
                <button type="button" onClick={() => setShowWeddingModal(false)} className="flex-1 py-3 border border-rose-200 text-slate-500 font-bold rounded-xl hover:bg-rose-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200">Update Wedding</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-rose-100 shadow-2xl">
            <div className="p-6 border-b border-rose-100 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-slate-800">
                {editing ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button onClick={() => {resetForm(); setShowModal(false);}} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Event Name *</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Reception" className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Date *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Start Time</label>
                  <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">End Time</label>
                  <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Venue</label>
                <input value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} placeholder="Venue name" className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Address</label>
                <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street, city" className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Notes</label>
                <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
              </div>

              <div className="flex gap-4 pt-4 border-t border-rose-100">
                <button type="button" onClick={resetForm} className="flex-1 py-3 border border-rose-200 text-slate-500 font-bold rounded-xl hover:bg-rose-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200">
                  {editing ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;