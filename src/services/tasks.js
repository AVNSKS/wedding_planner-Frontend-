import api from './api';

export const taskService = {
  getTasks: (weddingId) => api.get('/tasks', { params: { weddingId } }).then(res => res.data),
  createTask: (data, weddingId) => api.post('/tasks', { ...data, weddingId }).then(res => res.data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data).then(res => res.data),
  toggleTask: (id) => api.put(`/tasks/${id}`).then(res => res.data),
  deleteTask: (id) => api.delete(`/tasks/${id}`).then(res => res.data),
};
