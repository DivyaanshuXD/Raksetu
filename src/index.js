import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Keep your existing CSS import
import App from './App';
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import the i18n configuration

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </I18nextProvider>,
  document.getElementById('root')
);