import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import MyOrders from './pages/MyOrders';
import Loading from './components/Loading';
import './styles/App.css';

function App() {
  const { initialized, keycloak } = useKeycloak();

  if (!initialized) {
    return <Loading />;
  }

  if (!keycloak.authenticated) {
    return <Loading message="Redirecting to login..." />;
  }

  const hasRole = (role) => {
    return keycloak.hasRealmRole(role);
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/my-orders" element={<MyOrders />} />
          {hasRole('ADMIN') && (
            <Route path="/orders" element={<Orders />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
