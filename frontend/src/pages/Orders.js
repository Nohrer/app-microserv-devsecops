import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import '../styles/Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view all orders.');
      } else {
        setError('Failed to load orders. Please try again.');
      }
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      PROCESSING: 'status-processing',
      SHIPPED: 'status-shipped',
      DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return <div className="page-loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page admin-orders">
      <div className="page-header">
        <div>
          <h1>All Orders</h1>
          <p className="page-subtitle">Manage customer orders</p>
        </div>
        <div className="filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-stats">
        <div className="stat-item">
          <span className="stat-number">{orders.length}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {orders.filter(o => o.status === 'PENDING').length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {orders.filter(o => o.status === 'PROCESSING').length}
          </span>
          <span className="stat-label">Processing</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {orders.filter(o => o.status === 'DELIVERED').length}
          </span>
          <span className="stat-label">Delivered</span>
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card admin-order-card">
            <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
              <div className="order-info">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-customer">Customer: {order.username}</span>
                <span className="order-date">{formatDate(order.orderDate)}</span>
              </div>
              <div className="order-status-amount">
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
                <span className="order-total">${order.totalAmount.toFixed(2)}</span>
              </div>
              <svg 
                className={`expand-icon ${expandedOrder === order.id ? 'expanded' : ''}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            
            {expandedOrder === order.id && (
              <div className="order-details">
                <div className="order-details-header">
                  <h4>Order Items</h4>
                  <div className="status-update">
                    <label>Update Status:</label>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="status-select"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">${item.unitPrice.toFixed(2)}</span>
                      <span className="item-subtotal">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <span>Total Amount:</span>
                  <strong>${order.totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && !error && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <h3>No orders found</h3>
          <p>No orders match the current filter</p>
        </div>
      )}
    </div>
  );
}

export default Orders;
