import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import BloodHub from './components/BloodHub';
import DonateBlood from './components/DonateBlood';
import RequestBlood from './components/RequestBlood';
import FindDonors from './components/FindDonors';
import DonationHistory from './components/DonationHistory';
import EmergencyContacts from './components/EmergencyContacts';
import BloodBankManagement from './components/BloodBankManagement';
import Profile from './components/Profile';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
      console.log('Auth state changed:', user ? 'Authenticated' : 'Unauthenticated');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter text-neutral-700 dark:text-neutral-300">
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider value={{ theme, setTheme }}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <div className="min-h-screen bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/blood-hub" replace />
                  ) : (
                    <Home />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/blood-hub" replace />
                  ) : (
                    <Login />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <Navigate to="/blood-hub" replace />
                  ) : (
                    <Register />
                  )
                }
              />
              <Route
                path="/blood-hub"
                element={
                  isAuthenticated ? (
                    <BloodHub />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/blood-hub/donate-blood"
                element={
                  isAuthenticated ? (
                    <DonateBlood />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/blood-hub/request-blood"
                element={
                  isAuthenticated ? (
                    <RequestBlood />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/blood-hub/find-donors"
                element={
                  isAuthenticated ? (
                    <FindDonors />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/blood-hub/donation-history"
                element={
                  isAuthenticated ? (
                    <DonationHistory />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/blood-hub/emergency-contacts"
                element={
                  isAuthenticated ? (
                    <EmergencyContacts />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/blood-hub/blood-bank-management"
                element={
                  isAuthenticated ? (
                    <BloodBankManagement />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/blood-hub/profile"
                element={
                  isAuthenticated ? (
                    <Profile />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
};

export default App;