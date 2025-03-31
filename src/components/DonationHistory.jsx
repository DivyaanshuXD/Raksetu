import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const DonationHistory = () => {
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchDonations(currentUser.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchDonations = async (userId) => {
    try {
      const q = query(collection(db, 'donations'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const donationList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDonations(donationList);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter text-neutral-700 dark:text-neutral-300">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button onClick={handleBack} className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 mb-4">
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-inter">Back</span>
        </button>

        <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-8 font-inter">
          Donation History
        </h2>
        {donations.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-400 font-inter">
            No donations found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation, index) => (
              <motion.div
                key={donation.id}
                className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-inter">
                  Donation #{index + 1}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 font-inter mt-2">
                  Blood Group: {donation.bloodGroup}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-inter mt-2">
                  Date: {donation.donationDate}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-inter mt-2">
                  Location: {donation.location}
                </p>
                {donation.position && (
                  <p className="text-neutral-600 dark:text-neutral-400 font-inter mt-2">
                    Coordinates: {donation.position.lat}, {donation.position.lng}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DonationHistory;