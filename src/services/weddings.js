import api from './api';

export const weddingService = {
  // Get all weddings for the logged-in user
  getMyWeddings: () => api.get('/weddings/all')
    .then(res => res.data)
    .catch(err => {
      // Return empty array if no weddings exist
      if (err.response?.status === 404) {
        return { success: true, weddings: [] };
      }
      throw err;
    }),
  
  // Backward compatibility - gets first/most recent wedding
  getMyWedding: () => api.get('/weddings/my-wedding')
    .then(res => res.data)
    .catch(err => {
      // Silently handle 404 (no wedding exists yet)
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }),
  
  createWedding: (data) => api.post('/weddings', data).then(res => res.data),
  updateWedding: (id, data) => api.put(`/weddings/${id}`, data).then(res => res.data),
  deleteWedding: (id) => api.delete(`/weddings/${id}`).then(res => res.data),
  getWeddingById: (id) => api.get(`/weddings/${id}`).then(res => res.data),
};
