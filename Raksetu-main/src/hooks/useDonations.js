/**
 * useDonations Hook
 * Manages user donations state
 */

import { useState, useEffect } from 'react';
import { 
  subscribeToUserDonations,
  getDonationStats 
} from '../services/donationService';
import { 
  subscribeToUserAppointments,
  subscribeToUserDrives 
} from '../services/appointmentService';

export const useDonations = (userId) => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    livesImpacted: 0,
    pendingDonations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setDonations([]);
      setStats({
        totalDonations: 0,
        totalUnits: 0,
        livesImpacted: 0,
        pendingDonations: 0
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let appointmentsList = [];
    let drivesList = [];

    // Subscribe to appointments
    const unsubscribeAppointments = subscribeToUserAppointments(
      userId,
      (appointments, err) => {
        if (err) {
          console.error('Error loading appointments:', err);
          setError(err.message);
        } else {
          appointmentsList = appointments;
          setDonations([...appointmentsList, ...drivesList]);
        }
        setIsLoading(false);
      }
    );

    // Subscribe to drives
    const unsubscribeDrives = subscribeToUserDrives(
      userId,
      (drives, err) => {
        if (err) {
          console.error('Error loading drives:', err);
        } else {
          drivesList = drives;
          setDonations([...appointmentsList, ...drivesList]);
        }
      }
    );

    // Load donation stats
    getDonationStats(userId)
      .then(statsData => setStats(statsData))
      .catch(err => {
        console.error('Error loading donation stats:', err);
        setError(err.message);
      });

    return () => {
      unsubscribeAppointments();
      unsubscribeDrives();
    };
  }, [userId]);

  return {
    donations,
    stats,
    isLoading,
    error
  };
};
