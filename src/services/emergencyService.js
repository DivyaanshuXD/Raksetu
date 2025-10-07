/**
 * Emergency Service
 * Handles all emergency request-related Firebase operations
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
import { db, auth } from '../components/utils/firebase';
import { addEmergencyNotification } from '../components/utils/notifications';
import { URGENCY_PRIORITY, REQUEST_STATUS } from '../constants';
import cacheManager, { cachedQuery } from '../utils/cache';

/**
 * Get urgency level as number
 * @param {string} urgency - Urgency string
 * @returns {number} Urgency level
 */
const getUrgencyLevel = (urgency) => {
  return URGENCY_PRIORITY[urgency] || 2;
};

/**
 * Add a new emergency request
 * @param {Object} emergencyForm - Emergency form data
 * @param {Object} userLocation - User's location coordinates
 * @returns {Promise<string>} Document ID of created request
 */
export const addEmergencyRequest = async (emergencyForm, userLocation) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to submit an emergency request');
  }

  const emergencyData = {
    ...emergencyForm,
    userId: currentUser.uid,
    userName: currentUser.displayName || 'Anonymous',
    userEmail: currentUser.email,
    status: REQUEST_STATUS.ACTIVE,
    urgencyLevel: getUrgencyLevel(emergencyForm.urgency),
    timestamp: serverTimestamp(),
    coordinates: userLocation || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'emergencyRequests'), emergencyData);

    // Add a notification for all users
    await addEmergencyNotification({
      id: docRef.id,
      urgency: emergencyForm.urgency,
      message: emergencyForm.notes || 'No additional details provided',
      patientName: emergencyForm.patientName,
      hospital: emergencyForm.hospital
    });

    return docRef.id;
  } catch (error) {
    logger.error('Error adding emergency request:', error);
    throw error;
  }
};

/**
 * Get emergency request by ID (with caching)
 * CRITICAL: Cache for 10 seconds to enable instant loading
 * @param {string} requestId - Request ID
 * @returns {Promise<Object|null>} Emergency request or null
 */
export const getEmergencyRequest = async (requestId) => {
  const cacheKey = `emergency_${requestId}`;
  
  return cachedQuery(
    cacheKey,
    async () => {
      const requestRef = doc(db, 'emergencyRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (requestDoc.exists()) {
        return { id: requestDoc.id, ...requestDoc.data() };
      }
      return null;
    },
    10000 // 10 second cache for individual requests
  );
};

/**
 * Update emergency request
 * @param {string} requestId - Request ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateEmergencyRequest = async (requestId, updates) => {
  try {
    const requestRef = doc(db, 'emergencyRequests', requestId);
    await updateDoc(requestRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    logger.error('Error updating emergency request:', error);
    throw error;
  }
};

/**
 * Delete emergency request
 * @param {string} requestId - Request ID
 * @returns {Promise<void>}
 */
export const deleteEmergencyRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'emergencyRequests', requestId);
    await deleteDoc(requestRef);
  } catch (error) {
    logger.error('Error deleting emergency request:', error);
    throw error;
  }
};

/**
 * Get active emergency requests (with caching)
 * CRITICAL: Cache for 30 seconds - shows instant results while fetching fresh data
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of emergency requests
 */
export const getActiveEmergencyRequests = async (maxResults = 50) => {
  const cacheKey = `active_emergencies_${maxResults}`;
  
  return cachedQuery(
    cacheKey,
    async () => {
      const requestsQuery = query(
        collection(db, 'emergencyRequests'),
        where('status', '==', REQUEST_STATUS.ACTIVE),
        orderBy('urgencyLevel', 'desc'),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    30000 // 30 second cache for list view - balance freshness vs speed
  );
};

/**
 * Subscribe to emergency requests (real-time)
 * OPTIMIZED: Uses cached initial data for instant loading
 * @param {Function} callback - Callback function
 * @param {Object} filters - Optional filters { bloodType, status, maxResults }
 * @returns {Function} Unsubscribe function
 */
export const subscribeToEmergencyRequests = (callback, filters = {}) => {
  const { bloodType, status, maxResults = 50 } = filters;
  
  // Try to load from cache immediately for instant UX
  const cacheKey = `active_emergencies_${maxResults}`;
  cacheManager.get(cacheKey, 30000).then(cachedData => {
    if (cachedData && Array.isArray(cachedData)) {
      logger.info('[Emergency] Serving cached data instantly');
      callback(cachedData); // Show cached data immediately
    }
  });
  
  let requestsQuery = query(collection(db, 'emergencyRequests'));
  
  // Apply filters
  if (status) {
    requestsQuery = query(requestsQuery, where('status', '==', status));
  }
  
  if (bloodType && bloodType !== 'All') {
    requestsQuery = query(requestsQuery, where('bloodType', '==', bloodType));
  }
  
  requestsQuery = query(
    requestsQuery,
    orderBy('urgencyLevel', 'desc'),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );
  
  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Update cache with fresh data
      cacheManager.set(cacheKey, requests);
      callback(requests);
    },
    (error) => {
      logger.error('Error subscribing to emergency requests:', error);
      callback([], error);
    }
  );
};

/**
 * Get emergency requests by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's emergency requests
 */
export const getEmergencyRequestsByUser = async (userId) => {
  try {
    const requestsQuery = query(
      collection(db, 'emergencyRequests'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    logger.error('Error fetching user emergency requests:', error);
    throw error;
  }
};

/**
 * Mark emergency request as fulfilled
 * @param {string} requestId - Request ID
 * @returns {Promise<void>}
 */
export const markEmergencyAsFulfilled = async (requestId) => {
  return updateEmergencyRequest(requestId, {
    status: REQUEST_STATUS.FULFILLED,
    fulfilledAt: serverTimestamp()
  });
};

/**
 * Cancel emergency request
 * @param {string} requestId - Request ID
 * @returns {Promise<void>}
 */
export const cancelEmergencyRequest = async (requestId) => {
  return updateEmergencyRequest(requestId, {
    status: REQUEST_STATUS.CANCELLED,
    cancelledAt: serverTimestamp()
  });
};

