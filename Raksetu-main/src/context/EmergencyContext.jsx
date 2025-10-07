/**
 * EmergencyContext
 * Provides emergency requests state across the app
 */

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useEmergencies as useEmergenciesHook } from '../hooks/useEmergencies';
import { useGeolocation } from '../hooks/useGeolocation';

const EmergencyContext = createContext(null);

export const EmergencyProvider = ({ children }) => {
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { userLocation, isLoading: locationLoading } = useGeolocation();
  
  const { emergencies, allEmergencies, isLoading, error } = useEmergenciesHook(
    userLocation,
    {
      bloodType: bloodTypeFilter,
      distanceFilter,
      searchQuery
    }
  );

  const value = {
    emergencies,
    allEmergencies,
    isLoading,
    error,
    userLocation,
    locationLoading,
    bloodTypeFilter,
    setBloodTypeFilter,
    distanceFilter,
    setDistanceFilter,
    searchQuery,
    setSearchQuery
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
};

EmergencyProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useEmergencyContext = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergencyContext must be used within an EmergencyProvider');
  }
  return context;
};
