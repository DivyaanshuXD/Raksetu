/**
 * useRespondedEmergencies Hook
 * Tracks which emergencies the user has already responded to
 */

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../components/utils/firebase';

export const useRespondedEmergencies = (userId) => {
  const [respondedEmergencies, setRespondedEmergencies] = useState([]);

  useEffect(() => {
    if (!userId) {
      setRespondedEmergencies([]);
      return;
    }

    const donationsRef = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userId),
      where('type', '==', 'emergency'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      donationsRef,
      (snapshot) => {
        const responded = snapshot.docs.map((doc) => doc.data().id);
        setRespondedEmergencies(responded);
      },
      (error) => {
        console.error('Error fetching responded emergencies:', error);
        setRespondedEmergencies([]);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return respondedEmergencies;
};
