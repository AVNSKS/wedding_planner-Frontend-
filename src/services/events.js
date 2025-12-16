import api from './api';

export const eventsService = {
  getEvents: (weddingId) => api.get('/events', { params: { weddingId } }).then(res => res.data),
  getEvent: (id) => api.get(`/events/${id}`).then(res => res.data),
  createEvent: (data, weddingId) => api.post('/events', { ...data, weddingId }).then(res => res.data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data).then(res => res.data),
  deleteEvent: (id) => api.delete(`/events/${id}`).then(res => res.data),
};
