import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register service worker for PWA (enabled in both dev and prod for testing)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ [PWA] ServiceWorker registered:', registration.scope);
        
        // Check for updates every 60 seconds in production
        if (import.meta.env.PROD) {
          setInterval(() => {
            registration.update();
          }, 60000);
        }
      })
      .catch((error) => {
        console.error('❌ [PWA] ServiceWorker registration failed:', error);
      });
  });
} else {
  console.warn('⚠️ [PWA] ServiceWorker not supported in this browser');
}

// Note: React.StrictMode disabled due to Leaflet map initialization conflicts
// StrictMode causes double-rendering in dev, which breaks Leaflet's singleton pattern
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);