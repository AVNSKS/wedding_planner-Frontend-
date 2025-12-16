import api from './api';

export const bookingService = {
  // couple bookings
  getMyBookings: (weddingId) => api.get('/bookings/my-bookings', { params: { weddingId } }).then(res => res.data),

  // vendor bookings
  getVendorBookings: () => api.get('/bookings/vendor-bookings').then(res => res.data),

  // generic CRUD
  createBooking: (data, weddingId) => api.post('/bookings', { ...data, weddingId }).then(res => res.data),
  getBookingById: (id) => api.get(`/bookings/${id}`).then(res => res.data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data).then(res => res.data),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }).then(res => res.data),
  updatePayment: (id, payload) => api.put(`/bookings/${id}/payment`, payload).then(res => res.data),
  deleteBooking: (id) => api.delete(`/bookings/${id}`).then(res => res.data),
  
  // sync confirmed bookings to budget
  syncBudget: () => api.post('/bookings/sync-budget').then(res => res.data),
};
