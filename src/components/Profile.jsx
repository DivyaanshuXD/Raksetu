import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { ArrowRightOnRectangleIcon, ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter text-neutral-700 dark:text-neutral-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <motion.div
        className="max-w-2xl mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button onClick={handleBack} className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 mb-4">
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-inter">Back</span>
        </button>

        <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6 font-inter">
          Your Profile
        </h2>

        {/* Profile Card */}
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={user.photoURL || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-primary-500"
          />
          <div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 font-inter">
              {user.displayName || 'Not set'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              {user.email}
            </p>
            <button className="mt-2 flex items-center space-x-1 text-primary-500 hover:text-primary-600 font-inter">
              <PencilIcon className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-inter">
            Personal Information
          </h3>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Phone Number
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              {user.phoneNumber || 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Blood Group
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              A+ {/* Replace with actual data if stored in Firebase */}
            </p>
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Address
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              123 Main St, City, Country {/* Replace with actual data */}
            </p>
          </div>
        </div>

        {/* Donation Stats */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-inter">
            Donation Stats
          </h3>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Last Donation Date
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              January 15, 2025 {/* Replace with actual data */}
            </p>
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Total Donations
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              5 {/* Replace with actual data */}
            </p>
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Next Eligible Donation Date
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              April 15, 2025 {/* Calculated as 3 months after last donation */}
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-inter">
            Preferences
          </h3>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Preferred Language
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              English {/* Replace with actual data */}
            </p>
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Receive Notifications
            </label>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              Yes, via Email and SMS {/* Replace with actual data */}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Profile;