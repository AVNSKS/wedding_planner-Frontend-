import api from './api';

export const reminderService = {
  getReminders: (weddingId) => api.get('/reminders', { params: { weddingId } }).then(res => res.data),
  createReminder: (data, weddingId) => api.post('/reminders', { ...data, weddingId }).then(res => res.data),
  updateReminder: (id, data) => api.put(`/reminders/${id}`, data).then(res => res.data),
  deleteReminder: (id) => api.delete(`/reminders/${id}`).then(res => res.data),
};
