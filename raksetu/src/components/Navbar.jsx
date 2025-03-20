import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { CogIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 shadow-lg">
      <Link to="/" className="text-2xl font-bold tracking-tight">{t('welcome')}</Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/dashboard" className="text-sm font-medium hover:underline">{t('dashboard')}</Link>
            <Link to="/profile" className="hover:text-gray-200">
              <CogIcon className="w-6 h-6" />
            </Link>
            <button onClick={handleLogout} className="text-sm font-medium hover:underline">{t('logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium hover:underline">{t('login')}</Link>
            <Link to="/register" className="text-sm font-medium hover:underline">{t('register')}</Link>
          </>
        )}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-full dark:from-gray-600 dark:to-gray-500 dark:text-white transition-all hover:scale-105"
        >
          {darkMode ? t('lightMode') : t('darkMode')}
        </button>
        <div className="space-x-2">
          <button onClick={() => changeLanguage('en')} className="text-sm hover:underline">EN</button>
          <button onClick={() => changeLanguage('es')} className="text-sm hover:underline">ES</button>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);