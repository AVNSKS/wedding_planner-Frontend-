import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import { useWedding } from '../../context/WeddingContext';
import { bookingService } from '../../services/bookings';
import { vendorService } from '../../services/vendors';
import { eventsService } from '../../services/events';
import { 
  Store, Plus, AlertCircle, CheckCircle,
  Calendar, Phone, Mail, User, Search, Filter, X
} from 'lucide-react';

const Vendors = () => {
  // --- STATE MANAGEMENT ---
  const { wedding, loading: weddingLoading } = useWedding();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Data for Dropdowns
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [events, setEvents] = useState([]);

  const [formData, setFormData] = useState({
    serviceType: 'venue',
    vendorName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    totalAmount: '',
    advancePaid: '',
    bookingDate: '',
    eventDate: '',
    notes: ''
  });

  const serviceTypes = [
    'venue', 'caterer', 'photographer', 'decorator', 
    'makeup', 'dj', 'transportation', 'other'
  ];

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!weddingLoading && wedding) {
      fetchBookings();
      fetchVendors();
      fetchEvents();
    } else if (!weddingLoading && !wedding) {
      setLoading(false);
    }
  }, [wedding, weddingLoading]);

  const fetchBookings = async () => {
    if (!wedding) return;
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings(wedding._id);
      const bookingsData = Array.isArray(response.bookings || response) 
        ? (response.bookings || response) 
        : [];
      
      setBookings(bookingsData);
      
      // Calculate stats
      const statsData = {
        total: bookingsData.length,
        confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
        pending: bookingsData.filter(b => b.status === 'pending').length,
        totalAmount: bookingsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
      setStats({ total: 0, confirmed: 0, pending: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await vendorService.getVendors();
      setVendors(res.vendors || res || []);
    } catch (e) {
      setVendors([]);
    }
  };

  const fetchEvents = async () => {
    if (!wedding) return;
    try {
      const res = await eventsService.getEvents(wedding._id);
      setEvents(res.events || res || []);
    } catch (e) {
      setEvents([]);
    }
  };

  // --- HANDLERS ---
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        vendor: selectedVendorId || null,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        advancePaid: parseFloat(formData.advancePaid) || 0,
        status: editingBooking ? formData.status : 'pending' // Only set pending for new bookings
      };

      if (editingBooking) {
        await bookingService.updateBooking(editingBooking._id, payload);
        showMessage('success', 'Booking updated successfully!');
      } else {
        await bookingService.createBooking(payload);
        showMessage('success', 'Booking created successfully!');
      }
      resetForm();
      fetchBookings();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to save booking');
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    // If booking has a linked vendor ID, set it
    setSelectedVendorId(booking.vendor?._id || '');
    
    setFormData({
      serviceType: booking.serviceType || 'venue',
      vendorName: booking.vendor?.businessName || booking.vendorName || '',
      contactPerson: booking.vendor?.contactPerson || booking.contactPerson || '',
      email: booking.vendor?.email || booking.email || '',
      phone: booking.vendor?.phone || booking.phone || '',
      address: booking.vendor?.address || booking.address || '',
      totalAmount: booking.totalAmount || '',
      advancePaid: booking.advancePaid || '',
      bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
      eventDate: booking.eventDate ? new Date(booking.eventDate).toISOString().split('T')[0] : '',
      status: booking.status || 'pending',
      notes: booking.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await bookingService.deleteBooking(id);
      showMessage('success', 'Booking deleted successfully!');
      fetchBookings();
    } catch (error) {
      showMessage('error', 'Failed to delete booking');
    }
  };

  const resetForm = () => {
    setFormData({
      serviceType: 'venue',
      vendorName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      totalAmount: '',
      advancePaid: '',
      bookingDate: '',
      eventDate: '',
      notes: ''
    });
    setSelectedVendorId('');
    setEditingBooking(null);
    setShowAddModal(false);
  };

  const filteredBookings = bookings.filter(booking => {
    const vendorName = booking.vendor?.businessName || booking.vendorName || '';
    const serviceType = booking.serviceType || '';
    
    const matchesSearch = vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesService = filterService === 'all' || booking.serviceType === filterService;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 text-slate-600 pb-12 font-sans">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-rose-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2 flex items-center gap-3">
              Vendors & Bookings
            </h1>
            <p className="text-slate-500">Manage your service providers and payments.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              const today = new Date().toISOString().split('T')[0];
              // Auto-fill event date from wedding date if available
              const eventDate = wedding?.weddingDate 
                ? new Date(wedding.weddingDate).toISOString().split('T')[0]
                : '';
              setFormData(prev => ({ 
                ...prev, 
                bookingDate: today,
                eventDate: eventDate
              }));
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-200"
          >
            <Plus className="w-5 h-5" />
            Add Booking
          </button>
        </div>

        {/* --- MESSAGE ALERT --- */}
        {message.text && (
          <div 
            className={`p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-rose-50 border-rose-200 text-rose-500'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Bookings</p>
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-rose-500">₹{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-12 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full pl-12 pr-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
              >
                <option value="all">All Services</option>
                {serviceTypes.map(service => (
                  <option key={service} value={service}>{service.charAt(0).toUpperCase() + service.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- BOOKINGS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-rose-200">
              <Store className="w-12 h-12 mx-auto mb-4 text-rose-200" />
              <p>No bookings yet. Add your first vendor to get started!</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl border border-rose-100 p-6 hover:border-rose-300 hover:shadow-lg transition-all group shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      {booking.vendor?.businessName || booking.vendorName || 'Unnamed Vendor'}
                    </h3>
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-rose-500">
                      {booking.serviceType}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                    ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                      'bg-rose-100 text-rose-600'}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-sm text-slate-500">
                  {(booking.vendor?.contactPerson || booking.contactPerson) && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 flex-shrink-0 text-rose-300" />
                      <span>{booking.vendor?.contactPerson || booking.contactPerson}</span>
                    </div>
                  )}
                  {(booking.vendor?.phone || booking.phone) && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0 text-rose-300" />
                      <span>{booking.vendor?.phone || booking.phone}</span>
                    </div>
                  )}
                  {(booking.vendor?.email || booking.email) && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0 text-rose-300" />
                      <span className="truncate">{booking.vendor?.email || booking.email}</span>
                    </div>
                  )}
                  {booking.eventDate && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 flex-shrink-0 text-rose-500" />
                      <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="border-t border-rose-50 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-500">Total</span>
                    <span className="text-lg font-bold text-slate-800">₹{booking.totalAmount?.toLocaleString() || 0}</span>
                  </div>
                  {booking.advancePaid > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Advance</span>
                      <span className="text-sm font-semibold text-emerald-500">₹{booking.advancePaid?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="mb-4 p-3 bg-rose-50/50 rounded-lg border border-rose-100 text-xs text-slate-500 italic">
                    {booking.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(booking)}
                    className="flex-1 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(booking._id)}
                    className="flex-1 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-rose-100 shadow-2xl p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">
                {editingBooking ? 'Edit Booking' : 'Add New Booking'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Service Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Service Type *</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => {
                    const newServiceType = e.target.value;
                    setFormData({ ...formData, serviceType: newServiceType });
                    setSelectedVendorId(''); // Clear vendor selection when type changes
                  }}
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {serviceTypes.map(service => (
                    <option key={service} value={service}>{service.charAt(0).toUpperCase() + service.slice(1)}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">This determines which vendors are shown below.</p>
              </div>

              {/* Vendor Selection (Auto-fill logic) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Vendor
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => {
                    const vendorId = e.target.value;
                    setSelectedVendorId(vendorId);
                    
                    if (vendorId) {
                      // Logic: Auto-fill form from selected vendor
                      const selectedVendor = vendors.find(v => v._id === vendorId);
                      if (selectedVendor) {
                        setFormData(prev => ({
                          ...prev,
                          vendorName: selectedVendor.businessName || '',
                          contactPerson: selectedVendor.contactPerson || '',
                          phone: selectedVendor.phone || '',
                          email: selectedVendor.email || '',
                          address: selectedVendor.address || ''
                        }));
                      }
                    } else {
                      // Logic: Clear fields for manual entry
                      setFormData(prev => ({
                        ...prev,
                        vendorName: '', contactPerson: '', phone: '', email: '', address: ''
                      }));
                    }
                  }}
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">+ Add New Vendor (Manual Entry)</option>
                  {vendors
                    .filter(v => v.category === formData.serviceType)
                    .map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.businessName} ({v.category})
                      </option>
                    ))}
                </select>
              </div>
              
              {/* Vendor Details Form (Disable if auto-filled) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Vendor Business Name *</label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  required
                  disabled={!!selectedVendorId} // Disable if selected from dropdown
                  className={`w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 ${selectedVendorId ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    disabled={!!selectedVendorId}
                    className={`w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 ${selectedVendorId ? 'opacity-50 bg-slate-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!!selectedVendorId}
                    className={`w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 ${selectedVendorId ? 'opacity-50 bg-slate-50' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!selectedVendorId}
                  className={`w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 ${selectedVendorId ? 'opacity-50 bg-slate-50' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!!selectedVendorId}
                  className={`w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 ${selectedVendorId ? 'opacity-50 bg-slate-50' : ''}`}
                />
              </div>

              {/* Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Amount (₹) *</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    required
                    min="0"
                    className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={formData.advancePaid}
                    onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                    min="0"
                    className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Booking Date</label>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    readOnly={!editingBooking}
                    className={`w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 ${!editingBooking ? 'opacity-70 bg-slate-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Event Date *</label>
                  {events.length > 0 ? (
                    <select
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      required
                      className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="">Select an event</option>
                      {wedding?.weddingDate && (
                        <option value={new Date(wedding.weddingDate).toISOString().split('T')[0]}>
                          Wedding Day - {new Date(wedding.weddingDate).toLocaleDateString()}
                        </option>
                      )}
                      {events.map((event) => (
                        <option key={event._id} value={new Date(event.date).toISOString().split('T')[0]}>
                          {event.name} - {new Date(event.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      required
                      className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>
              </div>

              {/* Status (only show when editing) */}
              {editingBooking && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <p className="text-xs text-rose-500 mt-1">
                    ⚠️ Changing status to "Confirmed" will automatically update your budget!
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-rose-100 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 border border-rose-200 text-slate-500 font-bold rounded-xl hover:bg-rose-50 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200"
                >
                  {editingBooking ? 'Update Booking' : 'Add Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;