import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import '../styles/Dashboard.css';

function Dashboard() {
  const { keycloak } = useKeycloak();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    myOrders: 0
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = keycloak.hasRealmRole('ADMIN');
  const username = keycloak.tokenParsed?.preferred_username || 'User';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const products = await productService.getAll();
        const myOrders = await orderService.getMyOrders();
        
        let totalOrders = myOrders.length;
        if (isAdmin) {
          const allOrders = await orderService.getAll();
          totalOrders = allOrders.length;
        }

        setStats({
          totalProducts: products.length,
          totalOrders: totalOrders,
          myOrders: myOrders.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Welcome back, {username}</h1>
        <p className="page-subtitle">Here's what's happening with your business today</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.myOrders}</span>
            <span className="stat-label">My Orders</span>
          </div>
        </div>

        {isAdmin && (
          <div className="stat-card">
            <div className="stat-icon admin-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">All Orders</span>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon role-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{isAdmin ? 'Admin' : 'Client'}</span>
            <span className="stat-label">Your Role</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <a href="/products" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <span>Browse Products</span>
          </a>
          <a href="/my-orders" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span>View My Orders</span>
          </a>
          {isAdmin && (
            <a href="/orders" className="action-card">
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <span>Manage Orders</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
