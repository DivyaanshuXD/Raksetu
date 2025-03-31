import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png'; // Replace with your logo path

const DonateBlood = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    donationDate: '',
    location: '',
  });
  const [error, setError] = useState('');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'donations'), {
        userId: user.uid,
        ...formData,
        createdAt: new Date(),
      });
      alert('Donation recorded successfully!');
      navigate('/blood-hub');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter text-neutral-700 dark:text-neutral-300">
        <div className="text-center">
          <img
            src={logo}
            alt="Raksetu Logo"
            className="w-24 h-24 rounded-full border-4 border-primary-500 mx-auto mb-4"
          />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <motion.div
        className="max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6"
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
          Donate Blood
        </h2>
        {error && <p className="text-red-500 mb-4 font-inter">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
              Donation Date
            </label>
            <input
              type="date"
              name="donationDate"
              value={formData.donationDate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Donation
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default DonateBlood;