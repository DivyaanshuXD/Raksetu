/**
 * User Service
 * Handles all user-related Firebase operations
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../components/utils/firebase';

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User profile or null
 */
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create a new user profile
 * @param {string} userId - User ID
 * @param {Object} userData - User data
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId, userData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Delete user profile
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

/**
 * Subscribe to user profile updates (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserProfile = (userId, callback) => {
  const userDocRef = doc(db, 'users', userId);
  
  return onSnapshot(
    userDocRef,
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to user profile:', error);
      callback(null, error);
    }
  );
};

/**
 * Check if email already exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
export const checkEmailExists = async (email) => {
  try {
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const emailSnapshot = await getDocs(emailQuery);
    return !emailSnapshot.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

/**
 * Get users by blood type
 * @param {string} bloodType - Blood type to filter by
 * @returns {Promise<Array>} Array of users
 */
export const getUsersByBloodType = async (bloodType) => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('bloodType', '==', bloodType)
    );
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users by blood type:', error);
    throw error;
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} Array of all users
 */
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Subscribe to all users (real-time, admin only)
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAllUsers = (callback) => {
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(
    usersQuery,
    (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(users);
    },
    (error) => {
      console.error('Error subscribing to users:', error);
      callback([], error);
    }
  );
};
