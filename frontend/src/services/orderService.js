import api from './api';

export const orderService = {
  // Create order (CLIENT only)
  create: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Get my orders (CLIENT)
  getMyOrders: async () => {
    const response = await api.get('/api/orders/my-orders');
    return response.data;
  },

  // Get all orders (ADMIN only)
  getAll: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  // Get order by ID (ADMIN only)
  getById: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  // Update order status (ADMIN only)
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/orders/${id}/status?status=${status}`);
    return response.data;
  }
};
