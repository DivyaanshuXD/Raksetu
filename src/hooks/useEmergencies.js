/**
 * useEmergencies Hook
 * Manages emergency requests state and operations
 */

import { useState, useEffect, useMemo } from 'react';
import { subscribeToEmergencyRequests } from '../services/emergencyService';
import { sortByDistance, filterByDistance } from '../utils/distance';
import { REQUEST_STATUS } from '../constants';

export const useEmergencies = (userLocation, filters = {}) => {
  const [emergencies, setEmergencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { bloodType, distanceFilter, searchQuery, status = REQUEST_STATUS.ACTIVE } = filters;

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToEmergencyRequests(
      (requests, err) => {
        if (err) {
          setError(err.message);
          setEmergencies([]);
        } else {
          setEmergencies(requests);
        }
        setIsLoading(false);
      },
      { bloodType, status }
    );

    return () => {
      unsubscribe();
    };
  }, [bloodType, status]);

  // Filter and sort emergencies
  const filteredEmergencies = useMemo(() => {
    let filtered = [...emergencies];

    // Calculate distances if user location is available
    if (userLocation) {
      filtered = sortByDistance(
        filtered,
        userLocation.lat,
        userLocation.lng
      );

      // Apply distance filter
      if (distanceFilter) {
        filtered = filterByDistance(filtered, distanceFilter);
      }
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        emergency =>
          emergency.hospital?.toLowerCase().includes(query) ||
          emergency.location?.toLowerCase().includes(query) ||
          emergency.bloodType?.toLowerCase().includes(query) ||
          emergency.patientName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [emergencies, userLocation, distanceFilter, searchQuery]);

  return {
    emergencies: filteredEmergencies,
    allEmergencies: emergencies,
    isLoading,
    error
  };
};
