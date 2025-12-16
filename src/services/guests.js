import api from './api';

export const guestService = {
  getGuests: (weddingId) => api.get('/guests', { params: { weddingId } }).then(res => res.data),
  createGuest: (data, weddingId) => api.post('/guests', { ...data, weddingId }).then(res => res.data),
  updateGuest: (id, data) => api.put(`/guests/${id}`, data).then(res => res.data),
  deleteGuest: (id) => api.delete(`/guests/${id}`).then(res => res.data),
  sendInvitations: (weddingId) => api.post('/guests/send-invitations', { weddingId }).then(res => res.data),
  getRsvp: (token) => api.get(`/guests/rsvp/${token}`).then(res => res.data),
  submitRsvp: (token, data) => api.post(`/guests/rsvp/${token}`, data).then(res => res.data),
};
