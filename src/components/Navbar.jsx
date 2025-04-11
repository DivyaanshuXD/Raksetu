import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { UserIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
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
      <Link to="/" className="text-2xl font-bold tracking-tight transform transition-all hover:scale-105 hover:text-blue-200">
        {t('welcome')}
      </Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-medium transform transition-all hover:scale-105 hover:text-blue-200"
            >
              {t('dashboard')}
            </Link>
            <Link to="/profile" className="transform transition-all hover:scale-105 hover:text-blue-200">
              <UserIcon className="w-6 h-6" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium transform transition-all hover:scale-105 hover:text-blue-200"
            >
              {t('logout')}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium transform transition-all hover:scale-105 hover:text-blue-200"
            >
              {t('login')}
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium transform transition-all hover:scale-105 hover:text-blue-200"
            >
              {t('register')}
            </Link>
          </>
        )}
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-full dark:from-gray-600 dark:to-gray-500 dark:text-white transition-all hover:scale-105 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-500 dark:hover:to-gray-400"
        >
          {darkMode ? t('lightMode') : t('darkMode')}
        </button>
        <div className="space-x-2">
          <button
            onClick={() => changeLanguage('en')}
            className="text-sm transform transition-all hover:scale-105 hover:text-blue-200"
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('es')}
            className="text-sm transform transition-all hover:scale-105 hover:text-blue-200"
          >
            ES
          </button>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);