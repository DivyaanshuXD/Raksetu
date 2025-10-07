/**
 * useNearbyBloodBanks Hook
 * Fetches blood banks near a given location in real-time
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../components/utils/firebase';
import { calculateDistance, sortByDistance } from '../utils/distance';

export const useNearbyBloodBanks = (userLocation, maxDistance = 50) => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLocation) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bloodBanksQuery = query(collection(db, 'bloodBanks'));
      
      const unsubscribe = onSnapshot(
        bloodBanksQuery,
        (snapshot) => {
          const banks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Calculate distance for each bank
          const banksWithDistance = banks
            .map(bank => {
              if (!bank.coordinates) return null;
              
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                bank.coordinates.latitude,
                bank.coordinates.longitude
              );

              return {
                ...bank,
                distance
              };
            })
            .filter(bank => bank !== null && bank.distance <= maxDistance);

          // Sort by distance
          const sortedBanks = sortByDistance(banksWithDistance, userLocation);

          setBloodBanks(sortedBanks);
          setIsLoading(false);
        },
        (err) => {
          console.error('Error fetching blood banks:', err);
          setError('Failed to load blood banks');
          setBloodBanks([]);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up blood banks listener:', err);
      setError('Failed to load blood banks');
      setIsLoading(false);
    }
  }, [userLocation, maxDistance]);

  return { bloodBanks, isLoading, error };
};
