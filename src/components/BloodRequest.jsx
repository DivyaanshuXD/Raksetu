import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const RequestBlood = () => {
  const [user, setUser] = useState(null);
  const [bloodGroup, setBloodGroup] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState([]);
  const { t } = useTranslation();
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError('Unable to retrieve location. Using default location.');
          setLocation({ lat: 0, lng: 0 });
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLocation({ lat: 0, lng: 0 });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'bloodRequests'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error('Error fetching requests:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to request blood');
      return;
    }

    if (!bloodGroup || !quantity) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'bloodRequests'), {
        userId: user.uid,
        bloodGroup,
        quantity: parseInt(quantity),
        location,
        timestamp: new Date(),
      });
      setSuccess('Blood request submitted successfully!');
      setBloodGroup('');
      setQuantity('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 font-montserrat">{t('requestBlood')}</h2>
      <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
        {error && <p className="text-red-500 mb-4 font-poppins">{error}</p>}
        {success && <p className="text-green-500 mb-4 font-poppins">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bloodGroup" className="block text-gray-700 dark:text-gray-300 font-poppins font-medium">
              {t('bloodGroup')}
            </label>
            <select
              id="bloodGroup"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-poppins"
              required
            >
              <option value="">{t('selectBloodGroup')}</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-gray-700 dark:text-gray-300 font-poppins font-medium">
              {t('quantity')}
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-poppins"
              required
              min="1"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-500 hover:scale-105 font-poppins font-medium"
          >
            {t('submitRequest')}
          </button>
        </form>

        {requests.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 font-montserrat">Your Blood Requests</h3>
            <ul className="space-y-4">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md transform transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-600 dark:hover:to-gray-500"
                >
                  <p className="font-poppins"><strong>{t('bloodGroup')}:</strong> {request.bloodGroup}</p>
                  <p className="font-poppins"><strong>{t('quantity')}:</strong> {request.quantity} units</p>
                  <p className="font-poppins"><strong>{t('location')}:</strong> Lat: {request.location.lat}, Lng: {request.location.lng}</p>
                  <p className="font-poppins"><strong>Requested On:</strong> {new Date(request.timestamp.toDate()).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestBlood;