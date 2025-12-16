import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import AlertModal from '../../components/ui/AlertModal';
import { useWedding } from '../../context/WeddingContext';
import { guestService } from '../../services/guests';
import { 
  Users, Plus, Edit2, Trash2, Mail, Phone, 
  Search, Filter, Send, Copy, X
} from 'lucide-react';

const Guests = () => {
  const { wedding, loading: weddingLoading } = useWedding();
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, declined: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [sending, setSending] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [showSendConfirmModal, setShowSendConfirmModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', category: 'family', plusOneAllowed: false,
  });

  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    return status;
  };

  useEffect(() => {
    if (!weddingLoading && wedding) {
      fetchGuests();
    } else if (!weddingLoading && !wedding) {
      setLoading(false);
    }
  }, [wedding, weddingLoading]);

  const fetchGuests = async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const response = await guestService.getGuests(wedding._id);
      setGuests(response.guests || []);
      setStats(response.stats || { total: 0, confirmed: 0, pending: 0, declined: 0 });
    } catch (error) {
      setGuests([]);
      setStats({ total: 0, confirmed: 0, pending: 0, declined: 0 });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    const titles = { success: '✓ Success', error: '✗ Error' };
    setAlertModal({ isOpen: true, type, title: titles[type] || 'Notice', message: text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wedding) { showMessage('error', 'Please select a wedding first'); return; }
    try {
      if (editingGuest) {
        await guestService.updateGuest(editingGuest._id, formData);
        showMessage('success', 'Guest updated successfully!');
      } else {
        await guestService.createGuest(formData, wedding._id);
        showMessage('success', 'Guest added successfully!');
      }
      resetForm();
      fetchGuests();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to save guest');
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name, email: guest.email || '', phone: guest.phone || '', category: guest.category || 'family', plusOneAllowed: guest.plusOneAllowed || false,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    try {
      await guestService.deleteGuest(id);
      showMessage('success', 'Guest deleted successfully!');
      fetchGuests();
    } catch (error) {
      showMessage('error', 'Failed to delete guest');
    }
  };

  const handleSendInvitationsClick = () => { setShowSendConfirmModal(true); };

  const proceedSendInvitations = async () => {
    setShowSendConfirmModal(false);
    setSending(true);
    try {
      await guestService.sendInvitations();
      showMessage('success', 'Invitations sent successfully!');
    } catch (error) {
      showMessage('error', 'Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const copyRsvpLink = (token) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    showMessage('success', 'RSVP link copied to clipboard!');
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', category: 'family', plusOneAllowed: false });
    setEditingGuest(null);
    setShowAddModal(false);
  };

  const filteredGuests = guests.filter(guest => {
    const normalized = normalizeStatus(guest.rsvpStatus);
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || normalized === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const s = normalizeStatus(status);
    const styles = {
      confirmed: 'bg-emerald-100 text-emerald-600',
      declined: 'bg-rose-100 text-rose-600',
      maybe: 'bg-amber-100 text-amber-600',
      pending: 'bg-slate-100 text-slate-500',
    };
    const labels = { confirmed: 'Confirmed', declined: 'Declined', maybe: 'Maybe', pending: 'Pending', };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[s] || styles.pending}`}>
        {labels[s] || 'Pending'}
      </span>
    );
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
            <Users className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-3 text-slate-800">No Wedding Selected</h2>
            <p className="text-slate-500 mb-6">Please select a wedding from the header to manage guests.</p>
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
            <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-rose-500" />
              Guest List
            </h1>
            <p className="text-slate-500">Manage your wedding guests and track RSVPs</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSendInvitationsClick}
              disabled={sending}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-rose-200 text-slate-600 rounded-xl font-bold hover:bg-rose-50 transition-all disabled:opacity-50 shadow-sm"
            >
              <Send className="w-5 h-5 text-rose-500" />
              {sending ? 'Sending...' : 'Send Invites'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-black rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
            >
              <Plus className="w-5 h-5" />
              Add Guest
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Guests</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-emerald-500">{stats.confirmed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Pending</p>
            <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Declined</p>
            <p className="text-3xl font-bold text-rose-500">{stats.declined}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="maybe">Maybe</option>
                <option value="declined">Declined</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guests Table */}
        <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-rose-50 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="p-5">Name</th>
                  <th className="p-5">Contact</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Guests</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400">
                      No guests found. Add your first guest to get started!
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr key={guest._id} className="hover:bg-rose-50/50 transition-colors">
                      <td className="p-5 font-bold text-slate-800">{guest.name}</td>
                      <td className="p-5 text-sm text-slate-500">
                        {guest.email && <div className="flex items-center gap-2 mb-1"><Mail className="w-3 h-3" /> {guest.email}</div>}
                        {guest.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {guest.phone}</div>}
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 rounded bg-white text-slate-500 text-xs font-bold uppercase border border-rose-100 shadow-sm">{guest.category}</span>
                      </td>
                      <td className="p-5">{getStatusBadge(guest.rsvpStatus)}</td>
                      <td className="p-5 text-sm text-slate-600">{guest.attendeesCount || 1}{guest.plusOneAllowed && ' (+1)'}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => copyRsvpLink(guest.rsvpToken)} className="p-2 bg-white text-slate-500 rounded border border-rose-100 hover:bg-rose-50" title="Copy RSVP Link"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => handleEdit(guest)} className="p-2 bg-white text-slate-500 rounded border border-rose-100 hover:bg-rose-50" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(guest._id)} className="p-2 bg-white text-rose-500 rounded border border-rose-100 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-rose-100 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingGuest ? 'Edit Guest' : 'Add New Guest'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="colleagues">Colleagues</option>
                  <option value="relatives">Relatives</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="plusOne" checked={formData.plusOneAllowed} onChange={(e) => setFormData({ ...formData, plusOneAllowed: e.target.checked })} className="w-5 h-5 text-rose-500 rounded border-rose-300 focus:ring-rose-500" />
                <label htmlFor="plusOne" className="text-sm font-medium text-slate-600">Allow Plus One</label>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-rose-100 mt-6">
                <button type="button" onClick={resetForm} className="flex-1 py-3 border border-rose-200 text-slate-500 font-bold rounded-xl hover:bg-rose-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-rose-500 text-black font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200">{editingGuest ? 'Update Guest' : 'Add Guest'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Confirmation Modal */}
      {showSendConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 border border-rose-200 text-center shadow-2xl">
            <Send className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Send Invitations?</h3>
            <p className="text-slate-500 mb-6">Are you sure you want to send email invitations to all guests with email addresses?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowSendConfirmModal(false)} className="flex-1 py-3 border border-rose-200 text-slate-500 font-bold rounded-xl hover:bg-rose-50 transition-colors">Cancel</button>
              <button type="button" onClick={proceedSendInvitations} disabled={sending} className="flex-1 py-3 bg-rose-500 text-black font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200 disabled:opacity-50">{sending ? 'Sending...' : 'Send Now'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;