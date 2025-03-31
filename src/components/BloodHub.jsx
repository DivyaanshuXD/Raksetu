import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, UserIcon, ArrowRightOnRectangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Menu, Transition } from '@headlessui/react';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BloodHub = () => {
  const [user, setUser] = useState(null);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('BloodHub.jsx - Auth state:', currentUser ? 'Authenticated' : 'Unauthenticated');
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchBloodBanks = async () => {
      const mockBloodBanks = [
        { name: 'City Blood Bank', position: [51.505, -0.09] },
        { name: 'North Hospital Blood Bank', position: [51.515, -0.1] },
        { name: 'South Clinic Blood Bank', position: [51.495, -0.08] },
      ];
      setBloodBanks(mockBloodBanks);
    };

    fetchBloodBanks();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus('Thank you for your message! We will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const cardVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const components = [
    { name: t('donateBlood'), path: '/blood-hub/donate-blood' },
    { name: t('requestBlood'), path: '/blood-hub/request-blood' },
    { name: t('findDonors'), path: '/blood-hub/find-donors' },
    { name: t('donationHistory'), path: '/blood-hub/donation-history' },
    { name: t('emergencyContacts'), path: '/blood-hub/emergency-contacts' },
    { name: t('bloodBankManagement'), path: '/blood-hub/blood-bank-management' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <header className="p-4 bg-white dark:bg-neutral-800 shadow-md flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 font-inter">Raksetu</h1>
        <div className="flex items-center space-x-4">
          <Link to="/blood-hub/profile">
            <UserIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400" />
          </Link>
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center">
              <GlobeAltIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400" />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-800 rounded-lg shadow-lg z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`block w-full text-left px-4 py-2 text-neutral-700 dark:text-neutral-200 ${
                        active ? 'bg-primary-100 dark:bg-neutral-700' : ''
                      }`}
                    >
                      English
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => changeLanguage('es')}
                      className={`block w-full text-left px-4 py-2 text-neutral-700 dark:text-neutral-200 ${
                        active ? 'bg-primary-100 dark:bg-neutral-700' : ''
                      }`}
                    >
                      Spanish
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => changeLanguage('fr')}
                      className={`block w-full text-left px-4 py-2 text-neutral-700 dark:text-neutral-200 ${
                        active ? 'bg-primary-100 dark:bg-neutral-700' : ''
                      }`}
                    >
                      French
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
          <button onClick={toggleTheme}>
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400" />
            ) : (
              <SunIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400" />
            )}
          </button>
          <button onClick={handleLogout}>
            <ArrowRightOnRectangleIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-8 font-inter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('welcomeToBloodHub')}
        </motion.h2>

        {/* Component Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((component, index) => (
            <motion.div
              key={component.path}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={component.path}>
                <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-inter">
                    {component.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Map Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">
            {t('nearbyBloodBanks')}
          </h3>
          <div className="h-96 rounded-2xl overflow-hidden shadow-lg">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {bloodBanks.map((bank, index) => (
                <Marker key={index} position={bank.position}>
                  <Popup>{bank.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        {/* About Section with Contact Us */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">
            About Raksetu
          </h3>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6">
            <p className="text-neutral-600 dark:text-neutral-400 font-inter mb-6">
              Raksetu is a platform dedicated to connecting blood donors with those in need. Our mission is to make blood donation and request processes seamless, efficient, and accessible to everyone. Whether you're looking to donate, request blood, or find nearby donors, Raksetu is here to help.
            </p>
            <h4 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">
              Contact Us
            </h4>
            <form onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-neutral-700 dark:text-neutral-200 font-inter mb-2">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-inter focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="4"
                  required
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="w-full p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
              {formStatus && (
                <p className="mt-4 text-green-500 font-inter text-center">{formStatus}</p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BloodHub;