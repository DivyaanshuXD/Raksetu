/**
 * Appointment Service
 * Handles all appointment-related Firebase operations
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

/**
 * Add a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<string>} Document ID
 */
export const addAppointment = async (appointmentData) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
};

/**
 * Get appointment by ID
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object|null>} Appointment or null
 */
export const getAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentDoc = await getDoc(appointmentRef);
    
    if (appointmentDoc.exists()) {
      return { id: appointmentDoc.id, ...appointmentDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};

/**
 * Update appointment
 * @param {string} appointmentId - Appointment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateAppointment = async (appointmentId, updates) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

/**
 * Delete appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<void>}
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

/**
 * Get appointments by user
 * @param {string} userId - User ID
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of appointments
 */
export const getAppointmentsByUser = async (userId, maxResults = 50) => {
  try {
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(appointmentsQuery);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      type: 'appointment',
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
};

/**
 * Subscribe to user appointments (real-time)
 * Queries BOTH 'appointments' and 'donations' collections
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @param {number} maxResults - Maximum number of results
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserAppointments = (userId, callback, maxResults = 10) => {
  // Subscribe to appointments collection
  const appointmentsQuery = query(
    collection(db, 'appointments'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
  
  // Subscribe to donations collection (for appointments saved there)
  const donationsQuery = query(
    collection(db, 'donations'),
    where('userId', '==', userId),
    where('type', '==', 'appointment'),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
  
  let appointmentsFromAppointments = [];
  let appointmentsFromDonations = [];
  
  // Merge and callback
  const mergeAndCallback = () => {
    const allAppointments = [...appointmentsFromDonations, ...appointmentsFromAppointments]
      .sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate; // Descending order (newest first)
      })
      .slice(0, maxResults);
    callback(allAppointments);
  };
  
  // Listen to appointments collection
  const unsubscribe1 = onSnapshot(
    appointmentsQuery,
    (snapshot) => {
      appointmentsFromAppointments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'appointment',
          ...data,
          // Normalize date field: appointmentDate → date
          date: data.appointmentDate || data.date
        };
      });
      mergeAndCallback();
    },
    (error) => {
      console.error('Error subscribing to appointments collection:', error);
      appointmentsFromAppointments = [];
      mergeAndCallback();
    }
  );
  
  // Listen to donations collection
  const unsubscribe2 = onSnapshot(
    donationsQuery,
    (snapshot) => {
      appointmentsFromDonations = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'appointment',
          ...data,
          // Normalize date field: appointmentDate → date
          date: data.appointmentDate || data.date
        };
      });
      mergeAndCallback();
    },
    (error) => {
      console.error('Error subscribing to donations collection:', error);
      appointmentsFromDonations = [];
      mergeAndCallback();
    }
  );
  
  // Return combined unsubscribe function
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};

/**
 * Subscribe to user drives (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @param {number} maxResults - Maximum number of results
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserDrives = (userId, callback, maxResults = 10) => {
  const drivesQuery = query(
    collection(db, 'userDrives'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
  
  return onSnapshot(
    drivesQuery,
    (snapshot) => {
      const drives = snapshot.docs.map(doc => ({ 
        id: doc.id,
        type: 'drive',
        ...doc.data() 
      }));
      callback(drives);
    },
    (error) => {
      console.error('Error subscribing to drives:', error);
      callback([], error);
    }
  );
};
