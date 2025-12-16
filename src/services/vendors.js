import api from './api';

export const vendorService = {
  // Public - all vendors
  getVendors: () => api.get('/vendors').then(res => res.data),
  
  // Protected - logged-in vendor's own profile
  getMyProfile: () => api.get('/vendors/my/profile').then(res => res.data),
  
  // CRUD
  createVendor: (data) => api.post('/vendors', data).then(res => res.data),
  updateVendor: (id, data) => api.put(`/vendors/${id}`, data).then(res => res.data),
  deleteVendor: (id) => api.delete(`/vendors/${id}`).then(res => res.data),
  getVendorById: (id) => api.get(`/vendors/${id}`).then(res => res.data),
  addReview: (id, reviewData) => api.post(`/vendors/${id}/review`, reviewData).then(res => res.data),
};
