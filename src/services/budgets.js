import api from './api';

export const budgetService = {
  getBudgets: (weddingId) => api.get('/budgets', { params: { weddingId } }).then(res => res.data),
  createBudget: (data, weddingId) => api.post('/budgets', { ...data, weddingId }).then(res => res.data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data).then(res => res.data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`).then(res => res.data),
  getAlerts: (weddingId) => api.get('/budgets/alerts', { params: { weddingId } }).then(res => res.data),
};
