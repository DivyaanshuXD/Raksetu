import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to update map center based on user location
const SetMapCenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] !== 0 && position[1] !== 0) {
      map.setView(position, 13);
    }
  }, [position, map]);
  return null;
};

const FindDonors = () => {
  const [user, setUser] = useState(null);
  const [bloodType, setBloodType] = useState('');
  const [donors, setDonors] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [radius] = useState(50);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const bloodCompatibility = {
    'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
    'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
    'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
    'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
    'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
    'O+': { canDonateTo: ['A+', 'B+', 'AB+', 'O+'], canReceiveFrom: ['O+', 'O-'] },
    'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
  };

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (err) => {
          setError('Unable to retrieve location. Using default location.');
          setUserLocation([51.505, -0.09]); // Default to London instead of [0, 0]
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setUserLocation([51.505, -0.09]); // Default to London
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const donorsQuery = query(collection(db, 'users'));
    const unsubscribeDonors = onSnapshot(donorsQuery, (snapshot) => {
      const donorList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDonors(donorList);
    });

    const bloodBanksQuery = query(collection(db, 'bloodBanks'));
    const unsubscribeBloodBanks = onSnapshot(bloodBanksQuery, (snapshot) => {
      const bloodBankList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBloodBanks(bloodBankList);
    });

    return () => {
      unsubscribeDonors();
      unsubscribeBloodBanks();
    };
  }, [user]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = () => {
    if (!bloodType) {
      setError('Please enter a blood type.');
      return;
    }

    const compatibleDonors = donors.filter((donor) => {
      if (donor.role !== 'donor' || !donor.location) return false;
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        donor.location.lat,
        donor.location.lng
      );
      const isCompatible = bloodCompatibility[bloodType]?.canReceiveFrom.includes(donor.bloodGroup);
      return isCompatible && distance <= radius;
    });

    if (compatibleDonors.length === 0) {
      setError(t('noDonorsFound'));
    } else {
      setError('');
    }
  };

  const compatibleBloodBanks = bloodBanks.filter((bank) => {
    if (!bank.location) return false;
    const distance = calculateDistance(userLocation[0], userLocation[1], bank.location.lat, bank.location.lng);
    return distance <= radius && bank.stock && bank.stock[bloodType] > 0;
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter text-neutral-700 dark:text-neutral-300">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button onClick={handleBack} className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 mb-4">
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-inter">Back</span>
        </button>

        <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6 font-inter">{t('findDonors')}</h2>
        {error && (
          <motion.p
            className="text-red-500 mb-4 font-inter font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
        <motion.div
          className="mb-6 p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value.toUpperCase())}
              placeholder={t('searchPlaceholder')}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
            />
            <motion.button
              onClick={handleSearch}
              className="px-6 py-3 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t('searchButton')}
            </motion.button>
          </div>
          {bloodType && bloodCompatibility[bloodType] && (
            <div className="text-neutral-700 dark:text-neutral-300 font-inter">
              <p>
                <strong>{t('canDonateTo')}:</strong> {bloodCompatibility[bloodType].canDonateTo.join(', ')}
              </p>
              <p>
                <strong>{t('canReceiveFrom')}:</strong> {bloodCompatibility[bloodType].canReceiveFrom.join(', ')}
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          className="mb-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">{t('mapView')}</h3>
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
            className="rounded-2xl shadow-lg"
          >
            <SetMapCenter position={userLocation} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={userLocation}>
              <Popup>{t('youAreHere')}</Popup>
            </Marker>
            {donors.map((donor) => {
              if (
                donor.role === 'donor' &&
                donor.location &&
                bloodCompatibility[bloodType]?.canReceiveFrom.includes(donor.bloodGroup) &&
                calculateDistance(userLocation[0], userLocation[1], donor.location.lat, donor.location.lng) <= radius
              ) {
                return (
                  <Marker key={donor.id} position={[donor.location.lat, donor.location.lng]}>
                    <Popup>
                      {donor.name} ({donor.bloodGroup})<br />
                      {t('contact')}: {donor.phone}
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
            {compatibleBloodBanks.map((bank) => (
              <Marker key={bank.id} position={[bank.location.lat, bank.location.lng]}>
                <Popup>
                  {bank.name}<br />
                  {t('stock')}: {bank.stock[bloodType]} units of {bloodType}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

        {donors.filter(
          (donor) =>
            donor.role === 'donor' &&
            donor.location &&
            bloodCompatibility[bloodType]?.canReceiveFrom.includes(donor.bloodGroup) &&
            calculateDistance(userLocation[0], userLocation[1], donor.location.lat, donor.location.lng) <= radius
        ).length > 0 && (
          <motion.div
            className="mb-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">{t('nearbyDonors')}</h3>
            <ul className="space-y-4">
              {donors.map((donor) => {
                if (
                  donor.role === 'donor' &&
                  donor.location &&
                  bloodCompatibility[bloodType]?.canReceiveFrom.includes(donor.bloodGroup) &&
                  calculateDistance(userLocation[0], userLocation[1], donor.location.lat, donor.location.lng) <= radius
                ) {
                  return (
                    <motion.li
                      key={donor.id}
                      className="p-4 bg-primary-50 dark:bg-neutral-700 rounded-lg shadow-sm"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="font-inter font-semibold">
                        <strong>{t('name')}:</strong> {donor.name}
                      </p>
                      <p className="font-inter">
                        <strong>{t('bloodGroup')}:</strong> {donor.bloodGroup}
                      </p>
                      <p className="font-inter">
                        <strong>{t('contact')}:</strong> {donor.phone}
                      </p>
                      <p className="font-inter">
                        <strong>{t('location')}:</strong> Lat: {donor.location.lat}, Lng: {donor.location.lng}
                      </p>
                    </motion.li>
                  );
                }
                return null;
              })}
            </ul>
          </motion.div>
        )}

        {compatibleBloodBanks.length > 0 && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4 font-inter">{t('nearbyBloodBanks')}</h3>
            <ul className="space-y-4">
              {compatibleBloodBanks.map((bank) => (
                <motion.li
                  key={bank.id}
                  className="p-4 bg-primary-50 dark:bg-neutral-700 rounded-lg shadow-sm"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-inter font-semibold">
                    <strong>{t('name')}:</strong> {bank.name}
                  </p>
                  <p className="font-inter">
                    <strong>{t('address')}:</strong> {bank.address}
                  </p>
                  <p className="font-inter">
                    <strong>{t('stock')}:</strong> {bank.stock[bloodType]} units of {bloodType}
                  </p>
                  <p className="font-inter">
                    <strong>{t('location')}:</strong> Lat: {bank.location.lat}, Lng: {bank.location.lng}
                  </p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FindDonors;