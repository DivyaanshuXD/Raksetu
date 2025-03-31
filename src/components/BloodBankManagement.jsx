import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BloodBankManagement = () => {
  const [user, setUser] = useState(null);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchBloodBanks();
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchBloodBanks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'bloodBanks'));
      const bankList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBloodBanks(bankList);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bloodBanks'), {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        createdAt: new Date(),
      });
      setFormData({ name: '', location: '', latitude: '', longitude: '' });
      fetchBloodBanks();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'bloodBanks', id));
      fetchBloodBanks();
    } catch (error) {
      console.error('Error deleting blood bank:', error);
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
          Blood Bank Management
        </h2>

        {/* Add Blood Bank Form */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">
            Add New Blood Bank
          </h3>
          {error && <p className="text-red-500 mb-4 font-inter">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
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
              <div>
                <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
                  step="any"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
                  step="any"
                  required
                />
              </div>
            </div>
            <motion.button
              type="submit"
              className="w-full p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Blood Bank
            </motion.button>
          </form>
        </div>

        {/* Blood Bank List */}
        <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">
          Existing Blood Banks
        </h3>
        {bloodBanks.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-400 font-inter">
            No blood banks found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bloodBanks.map((bank, index) => (
              <motion.div
                key={bank.id}
                className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h4 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-inter">
                  {bank.name}
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 font-inter mt-2">
                  Location: {bank.location}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-inter mt-2">
                  Coordinates: {bank.latitude}, {bank.longitude}
                </p>
                <button
                  onClick={() => handleDelete(bank.id)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 font-inter font-semibold"
                >
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BloodBankManagement;