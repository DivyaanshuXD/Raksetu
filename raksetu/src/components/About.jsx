import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1576091160550-2173fd1bece7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">{t('welcome')}</h1>
        <p className="text-lg text-gray-200 mb-8 animate-fade-in-delayed">
          Connecting blood donors and recipients to save lives. Join our community and make a difference today.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105 shadow-md"
          >
            {t('login')}
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full hover:from-green-600 hover:to-green-700 transition-all hover:scale-105 shadow-md"
          >
            {t('register')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(About);