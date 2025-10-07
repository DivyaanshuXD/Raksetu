/**
 * Donation Service
 * Handles all donation-related Firebase operations
 */

import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../components/utils/firebase';
import { DONATION_STATUS } from '../constants';
import { checkAndUpdateChallenges } from './challengesService';

/**
 * Add a new donation record
 * @param {Object} donationData - Donation data
 * @returns {Promise<string>} Document ID
 */
export const addDonation = async (donationData) => {
  try {
    const docRef = await addDoc(collection(db, 'donationsDone'), {
      ...donationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding donation:', error);
    throw error;
  }
};

/**
 * Get donation by ID
 * @param {string} donationId - Donation ID
 * @returns {Promise<Object|null>} Donation or null
 */
export const getDonation = async (donationId) => {
  try {
    const donationRef = doc(db, 'donationsDone', donationId);
    const donationDoc = await getDoc(donationRef);
    
    if (donationDoc.exists()) {
      return { id: donationDoc.id, ...donationDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching donation:', error);
    throw error;
  }
};

/**
 * Update donation
 * @param {string} donationId - Donation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateDonation = async (donationId, updates) => {
  try {
    const donationRef = doc(db, 'donationsDone', donationId);
    await updateDoc(donationRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    throw error;
  }
};

/**
 * Delete donation
 * @param {string} donationId - Donation ID
 * @returns {Promise<void>}
 */
export const deleteDonation = async (donationId) => {
  try {
    const donationRef = doc(db, 'donationsDone', donationId);
    await deleteDoc(donationRef);
  } catch (error) {
    console.error('Error deleting donation:', error);
    throw error;
  }
};

/**
 * Get donations by user
 * @param {string} userId - User ID
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of donations
 */
export const getDonationsByUser = async (userId, maxResults = 50) => {
  try {
    const donationsQuery = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(donationsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user donations:', error);
    throw error;
  }
};

/**
 * Subscribe to user donations (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @param {Object} filters - Optional filters
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserDonations = (userId, callback, filters = {}) => {
  const { type, status, maxResults = 50 } = filters;
  
  let donationsQuery = query(
    collection(db, 'donationsDone'),
    where('userId', '==', userId)
  );
  
  if (type) {
    donationsQuery = query(donationsQuery, where('type', '==', type));
  }
  
  if (status) {
    donationsQuery = query(donationsQuery, where('status', '==', status));
  }
  
  donationsQuery = query(
    donationsQuery,
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
  
  return onSnapshot(
    donationsQuery,
    (snapshot) => {
      const donations = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      callback(donations);
    },
    (error) => {
      console.error('Error subscribing to donations:', error);
      callback([], error);
    }
  );
};

/**
 * Get pending donations for emergency requests
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of pending emergency donations
 */
export const getPendingEmergencyDonations = async (userId) => {
  try {
    const donationsQuery = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userId),
      where('type', '==', 'emergency'),
      where('status', '==', DONATION_STATUS.PENDING)
    );
    
    const snapshot = await getDocs(donationsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching pending emergency donations:', error);
    throw error;
  }
};

/**
 * Mark donation as completed
 * @param {string} donationId - Donation ID
 * @param {string} userId - User ID (optional, for challenge tracking)
 * @returns {Promise<void>}
 */
export const completeDonation = async (donationId, userId = null) => {
  await updateDonation(donationId, {
    status: DONATION_STATUS.COMPLETED,
    completedAt: serverTimestamp()
  });

  // Update challenge progress if userId is provided
  if (userId) {
    try {
      const donationRef = doc(db, 'donationsDone', donationId);
      const donationDoc = await getDoc(donationRef);
      
      if (donationDoc.exists()) {
        const donationData = donationDoc.data();
        await checkAndUpdateChallenges(userId, {
          isEmergency: donationData.type === 'emergency',
          urgency: donationData.urgency || 'normal',
          bloodType: donationData.bloodTypeRequested || donationData.bloodType,
          responseTime: donationData.responseTime || null,
          distance: donationData.distance || null,
          completedAt: new Date()
        });
        console.log('✅ Challenge progress updated for donation:', donationId);
      }
    } catch (challengeError) {
      console.error('⚠️ Failed to update challenge progress:', challengeError);
    }
  }
};

/**
 * Cancel donation
 * @param {string} donationId - Donation ID
 * @returns {Promise<void>}
 */
export const cancelDonation = async (donationId) => {
  return updateDonation(donationId, {
    status: DONATION_STATUS.CANCELLED,
    cancelledAt: serverTimestamp()
  });
};

/**
 * Get user's last donation date
 * @param {string} userId - User ID
 * @returns {Promise<Date|null>} Last donation date or null
 */
export const getLastDonationDate = async (userId) => {
  try {
    const donationsQuery = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userId),
      where('status', '==', DONATION_STATUS.COMPLETED),
      orderBy('completedAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(donationsQuery);
    if (!snapshot.empty) {
      const lastDonation = snapshot.docs[0].data();
      return lastDonation.completedAt?.toDate() || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching last donation date:', error);
    throw error;
  }
};

/**
 * Get donation statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Donation statistics
 */
export const getDonationStats = async (userId) => {
  try {
    const donations = await getDonationsByUser(userId, 1000);
    
    const completed = donations.filter(d => d.status === DONATION_STATUS.COMPLETED);
    const totalUnits = completed.reduce((sum, d) => sum + (d.units || 1), 0);
    const livesImpacted = totalUnits * 3; // Assuming 1 unit can save 3 lives
    
    return {
      totalDonations: completed.length,
      totalUnits,
      livesImpacted,
      pendingDonations: donations.filter(d => d.status === DONATION_STATUS.PENDING).length
    };
  } catch (error) {
    console.error('Error calculating donation stats:', error);
    throw error;
  }
};
