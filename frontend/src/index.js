import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import App from './App';
import keycloak from './config/keycloak';
import './styles/index.css';

const eventLogger = (event, error) => {
  console.log('Keycloak event:', event, error);
};

const tokenLogger = (tokens) => {
  console.log('Keycloak tokens:', tokens);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ReactKeycloakProvider
    authClient={keycloak}
    onEvent={eventLogger}
    onTokens={tokenLogger}
    initOptions={{
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    }}
  >
    <App />
  </ReactKeycloakProvider>
);
