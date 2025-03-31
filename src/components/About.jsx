import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen">
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1576091160550-2173fd1bece7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        }}
      >
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">{t('welcome')}</h1>
          <p className="text-lg text-gray-200 mb-8 animate-fade-in-delayed">
            A platform dedicated to connecting blood donors and recipients to save lives. Join our community and make a difference today.
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

      <section className="py-16 px-4">
        <h2 className="text-4xl font-bold text-center text-gray W-800 dark:text-white mb-12">What is Raksetu?</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Raksetu is a life-saving platform designed to bridge the gap between blood donors and recipients. Our mission is to make blood donation accessible, efficient, and impactful by connecting people in need with willing donors in their area.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Whether you're a donor looking to contribute or a recipient in need of blood, Raksetu provides a seamless experience to find matches, track donation history, and access emergency contacts.
            </p>
          </div>
          <div className="transform transition-all hover:scale-105">
            <img
              src="https://images.unsplash.com/photo-1582719183514-7a1e5e95e4e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Blood donation"
              className="rounded-xl shadow-lg w-full h-64 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
        <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">How Raksetu Works</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <HeartIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">Register & Share</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              Sign up as a donor or recipient and share your blood group and location.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <UserGroupIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">Find Matches</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              Search for compatible donors or recipients in your area.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <MapPinIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">Connect & Save Lives</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              Connect with matches and coordinate blood donations to save lives.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">Join Raksetu Today</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Be a part of our community and help save lives through blood donation.
        </p>
        <Link
          to="/register"
          className="px-8 py-4 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full hover:from-green-600 hover:to-green-700 transition-all hover:scale-105 shadow-md text-lg font-semibold"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
};

export default React.memo(About);