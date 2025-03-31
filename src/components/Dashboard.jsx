import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { UserGroupIcon, ClockIcon, PhoneIcon, BuildingOfficeIcon, HeartIcon } from '@heroicons/react/24/outline';
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
    <div className="p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('dashboard')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/find-donors">
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <UserGroupIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">{t('findDonors')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              Search for blood donors in your area.
            </p>
          </div>
        </Link>
        <Link to="/donation-history">
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <ClockIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">{t('donationHistory')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              View your past blood donations.
            </p>
          </div>
        </Link>
        <Link to="/emergency-contacts">
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <PhoneIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">{t('emergencyContacts')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              Access emergency contact information.
            </p>
          </div>
        </Link>
        <Link to="/blood-bank-management">
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <BuildingOfficeIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">{t('bloodBankManagement')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              Manage blood bank stocks and donations.
            </p>
          </div>
        </Link>
        <Link to="/blood-request">
          <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
            <HeartIcon className="w-12 h-12 text-blue-500 dark:text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white text-center">{t('bloodRequest')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
              Request blood from donors or blood banks.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);