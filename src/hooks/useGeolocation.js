/**
 * useGeolocation Hook
 * Manages user's geolocation state
 */

import { useState, useEffect } from 'react';
import { DEFAULT_MAP_CENTER } from '../constants';

export const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      setUserLocation(DEFAULT_MAP_CENTER);
      return;
    }

    setIsLoading(true);

    // Request user's current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setPermissionStatus('granted');
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError(err.message);
        setPermissionStatus('denied');
        // Fallback to default location
        setUserLocation(DEFAULT_MAP_CENTER);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );

    // Watch for position changes
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 600000 // 10 minutes
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation not supported'));
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setPermissionStatus('granted');
          resolve(location);
        },
        (err) => {
          setError(err.message);
          setPermissionStatus('denied');
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000
        }
      );
    });
  };

  return {
    userLocation,
    isLoading,
    error,
    permissionStatus,
    requestLocation
  };
};
