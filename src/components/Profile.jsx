import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';
import { ArrowRightOnRectangleIcon, ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase'; // Ensure db is imported
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    bloodGroup: '',
    address: '',
    lastDonationDate: '',
    totalDonations: '',
    nextEligibleDate: '',
    preferredLanguage: '',
    receiveNotifications: '',
  });
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch additional data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            displayName: currentUser.displayName || data.displayName || '',
            phoneNumber: currentUser.phoneNumber || data.phoneNumber || '',
            bloodGroup: data.bloodGroup || '',
            address: data.address || '',
            lastDonationDate: data.lastDonationDate || '',
            totalDonations: data.totalDonations || '',
            nextEligibleDate: data.nextEligibleDate || '',
            preferredLanguage: data.preferredLanguage || '',
            receiveNotifications: data.receiveNotifications || '',
          });
        }
        setLoadingData(false);
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

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        lastDonationDate: formData.lastDonationDate,
        totalDonations: formData.totalDonations,
        nextEligibleDate: formData.nextEligibleDate,
        preferredLanguage: formData.preferredLanguage,
        receiveNotifications: formData.receiveNotifications,
      });
      await updateProfile(auth.currentUser, { displayName: formData.displayName });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  if (!user || loadingData) {
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
            alt=""
            className="w-24 h-24 rounded-full object-cover border-4 border-primary-500"
          />
          <div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 font-inter">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                />
              ) : (
                formData.displayName || 'Not set'
              )}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter">
              {user.email}
            </p>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(!isEditing)}
              className="mt-2 flex items-center space-x-1 text-primary-500 hover:text-primary-600 font-inter"
            >
              <PencilIcon className="h-4 w-4" />
              <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
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
            {isEditing ? (
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.phoneNumber || 'Not set'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Blood Group
            </label>
            {isEditing ? (
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              >
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.bloodGroup || 'Not set'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.address || 'Not set'}
              </p>
            )}
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
            {isEditing ? (
              <input
                type="date"
                value={formData.lastDonationDate}
                onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.lastDonationDate || 'Not set'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Total Donations
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.totalDonations}
                onChange={(e) => setFormData({ ...formData, totalDonations: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                min="0"
              />
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.totalDonations || '0'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Next Eligible Donation Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formData.nextEligibleDate}
                onChange={(e) => setFormData({ ...formData, nextEligibleDate: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.nextEligibleDate || 'Not set'}
              </p>
            )}
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
            {isEditing ? (
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
              </select>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.preferredLanguage || 'Not set'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter font-medium">
              Receive Notifications
            </label>
            {isEditing ? (
              <select
                value={formData.receiveNotifications}
                onChange={(e) => setFormData({ ...formData, receiveNotifications: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              >
                <option value="">Select Option</option>
                <option value="Yes, via Email and SMS">Yes, via Email and SMS</option>
                <option value="No">No</option>
              </select>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 font-inter">
                {formData.receiveNotifications || 'Not set'}
              </p>
            )}
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