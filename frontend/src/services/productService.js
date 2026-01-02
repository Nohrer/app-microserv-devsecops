import api from './api';

export const productService = {
  // Get all products
  getAll: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Create product (ADMIN only)
  create: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  // Update product (ADMIN only)
  update: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  // Delete product (ADMIN only)
  delete: async (id) => {
    await api.delete(`/api/products/${id}`);
  }
};
