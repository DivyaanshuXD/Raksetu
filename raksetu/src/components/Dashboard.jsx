import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
  const [bloodType, setBloodType] = useState('');
  const [donors, setDonors] = useState([]);
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation({ lat: 0, lng: 0 });
        }
      );
    } else {
      setUserLocation({ lat: 0, lng: 0 });
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!bloodType || !userLocation) return;

    setLoading(true);
    const q = query(collection(db, 'users'), where('bloodGroup', '==', bloodType), where('role', '==', 'donor'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let allDonors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const filteredDonors = allDonors.filter((donor) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          donor.location.lat,
          donor.location.lng
        );
        return distance <= radius;
      });

      if (filteredDonors.length === 0 && radius < 50) {
        setRadius(radius + 10);
      } else {
        setDonors(filteredDonors);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching donors:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bloodType, userLocation, radius]);

  useEffect(() => {
    const fetchDonationHistory = () => {
      const q = query(collection(db, 'donations'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setDonationHistory(snapshot.docs.map((doc) => doc.data()));
      }, (error) => {
        console.error('Error fetching donation history:', error);
      });
      return unsubscribe;
    };

    const fetchEmergencyContacts = () => {
      const q = query(collection(db, 'emergencyContacts'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setEmergencyContacts(snapshot.docs.map((doc) => doc.data()));
      }, (error) => {
        console.error('Error fetching emergency contacts:', error);
      });
      return unsubscribe;
    };

    const unsubscribeDonations = fetchDonationHistory();
    const unsubscribeContacts = fetchEmergencyContacts();

    return () => {
      unsubscribeDonations();
      unsubscribeContacts();
    };
  }, []);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('dashboard')}</h2>
      <section className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">{t('donationHistory')}</h3>
        {donationHistory.length > 0 ? (
          <ul className="space-y-2">
            {donationHistory.map((donation, index) => (
              <li key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                {donation.date} - {donation.bloodGroup} at {donation.location}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">{t('noHistory')}</p>
        )}
      </section>
      <section className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">{t('emergencyContacts')}</h3>
        {emergencyContacts.length > 0 ? (
          <ul className="space-y-2">
            {emergencyContacts.map((contact, index) => (
              <li key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                {contact.name} - {contact.phone}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">{t('noContacts')}</p>
        )}
      </section>
      <section className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">{t('findDonors')}</h3>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={loading}
          />
          <button
            onClick={() => setBloodType(bloodType)}
            className="px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '...' : t('searchButton')}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('searching', { radius })}</p>
        {loading ? (
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingDonors')}</p>
        ) : donors.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {donors.map((donor) => (
              <li key={donor.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                {donor.name} - {donor.bloodGroup}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('noDonors')}</p>
        )}
      </section>
    </div>
  );
};

export default React.memo(Dashboard);