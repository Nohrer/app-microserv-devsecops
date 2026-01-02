import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import '../styles/Orders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view orders.');
      } else {
        setError('Failed to load orders. Please try again.');
      }
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="page-loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>My Orders</h1>
        <p className="page-subtitle">View your order history</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
              <div className="order-info">
                <span className="order-id">Order #{order.id}</span>
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
                <h4>Order Items</h4>
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

      {orders.length === 0 && !loading && !error && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <a href="/products" className="btn-primary">Browse Products</a>
        </div>
      )}
    </div>
  );
}

export default MyOrders;
