/**
 * useAuth Hook
 * Manages authentication state and operations
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { auth, messaging } from '../components/utils/firebase';
import { 
  getUserProfile, 
  createUserProfile, 
  subscribeToUserProfile 
} from '../services/userService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setError(null);

      if (user) {
        setIsLoggedIn(true);
        
        try {
          // Subscribe to real-time profile updates
          const unsubscribeProfile = subscribeToUserProfile(user.uid, async (profileData) => {
            if (profileData) {
              setUserProfile({
                id: user.uid,
                email: user.email,
                photoURL: user.photoURL,
                ...profileData
              });
              setIsLoading(false);
            } else {
              // Create default profile if doesn't exist
              const defaultProfile = {
                name: user.displayName || 'User',
                email: user.email || '',
                phone: user.phoneNumber || '',
                photoURL: user.photoURL || '',
                bloodType: '',
                dob: '',
                lastDonated: '',
                address: '',
                city: ''
              };
              
              try {
                await createUserProfile(user.uid, defaultProfile);
                setUserProfile({
                  id: user.uid,
                  ...defaultProfile
                });
                setIsLoading(false);
              } catch (err) {
                console.error('Error creating profile:', err);
                setError(err.message);
                setIsLoading(false);
              }
            }
          });

          // FCM subscription for blood type notifications
          // Only enable in production (requires HTTPS)
          if (window.location.protocol === 'https:' && import.meta.env.VITE_VAPID_KEY) {
            try {
              const token = await getToken(messaging, { 
                vapidKey: import.meta.env.VITE_VAPID_KEY 
              });
              
              // Subscribe to topics based on blood type (if available)
              const profile = await getUserProfile(user.uid);
              if (profile?.bloodType && token) {
                fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
                  method: 'POST',
                  headers: { 
                    'Authorization': `key=${import.meta.env.VITE_SERVER_KEY}` 
                  },
                  body: JSON.stringify({
                    to: `/topics/bloodType_${profile.bloodType}`,
                    registration_tokens: [token]
                  })
                }).catch(err => console.warn('FCM subscription failed:', err));
              }
            } catch (fcmError) {
              // Silenced in development - FCM requires HTTPS
              if (import.meta.env.MODE === 'production') {
                console.warn('FCM token retrieval failed:', fcmError);
              }
            }
          }

          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', user.uid);

          return () => {
            unsubscribeProfile();
          };
        } catch (err) {
          console.error('Error loading user profile:', err);
          setError(err.message);
          setUserProfile(null);
          setIsLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setIsLoading(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  return {
    isLoggedIn,
    userProfile,
    isLoading,
    error
  };
};
