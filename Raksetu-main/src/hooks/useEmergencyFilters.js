/**
 * useEmergencyFilters Hook
 * Manages emergency request filtering logic
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { calculateDistance } from '../utils/distance';
import { RARE_BLOOD_TYPES } from '../constants/bloodTypes';

export const useEmergencyFilters = (emergencyRequests, userLocation) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState(null);

  const filteredEmergencies = useMemo(() => {
    if (!emergencyRequests) return [];

    let filtered = [...emergencyRequests];

    // TASK 1: Hide fulfilled emergency requests (responseCount >= units needed)
    filtered = filtered.filter((e) => {
      const unitsNeeded = parseInt(e.units) || 1;
      const responsesReceived = parseInt(e.responseCount) || 0;
      return responsesReceived < unitsNeeded; // Only show unfulfilled requests
    });

    // Blood type filter
    if (bloodTypeFilter !== 'All') {
      filtered = filtered.filter((e) => e.bloodType === bloodTypeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((e) =>
        (e.hospital && e.hospital.toLowerCase().includes(query)) ||
        (e.location && e.location.toLowerCase().includes(query)) ||
        (e.bloodType && e.bloodType.toLowerCase().includes(query))
      );
    }

    // Distance filter
    if (distanceFilter && userLocation) {
      filtered = filtered.filter((e) => {
        if (!e.coordinates) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          e.coordinates.latitude,
          e.coordinates.longitude
        );
        return distance <= distanceFilter;
      });
    }

    // Mark rare blood types and add calculated distance
    filtered = filtered.map((e) => {
      // TASK 2: Calculate real distance
      let calculatedDistance = null;
      if (userLocation && e.coordinates) {
        calculatedDistance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          e.coordinates.latitude,
          e.coordinates.longitude
        );
      }

      return {
        ...e,
        isRare: RARE_BLOOD_TYPES.includes(e.bloodType),
        donorsResponded: e.donorsResponded || 0,
        calculatedDistance // Add distance to emergency object
      };
    });

    return filtered;
  }, [emergencyRequests, bloodTypeFilter, searchQuery, distanceFilter, userLocation]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setBloodTypeFilter('All');
    setDistanceFilter(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    bloodTypeFilter,
    setBloodTypeFilter,
    distanceFilter,
    setDistanceFilter,
    filteredEmergencies,
    clearFilters
  };
};
