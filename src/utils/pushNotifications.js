/**
 * Push Notification Service
 * Manages FCM tokens, permissions, and notification delivery
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../components/utils/firebase';

// VAPID key from Firebase Console → Project Settings → Cloud Messaging
const VAPID_KEY = 'BOe2o8DKxWr3CZI73pFOFWvZezgEam0OXrhBsIoh-PAo4wmFkVj4akHrjhr5W-bhLZRPC0lImL7-T227JQinb5k'; // Replace with your actual VAPID key

/**
 * Check if notifications are supported
 */
export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check current permission status
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission and get FCM token
 * @param {string} userId - Current user ID
 * @returns {Promise<string|null>} FCM token or null
 */
export async function requestNotificationPermission(userId) {
  try {
    if (!isNotificationSupported()) {
      console.warn('⚠️  Push notifications not supported in this browser');
      return null;
    }

    // Check if already granted
    if (Notification.permission === 'granted') {
      return await getFCMToken(userId);
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return await getFCMToken(userId);
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

/**
 * Get FCM token and save to user profile
 * @param {string} userId - Current user ID
 * @returns {Promise<string|null>} FCM token or null
 */
async function getFCMToken(userId) {
  try {
    const messaging = getMessaging();
    
    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ Service Worker registered:', registration);

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
      
      // Save token to user profile
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token,
          notificationsEnabled: true,
          notificationPermission: 'granted',
          lastTokenUpdate: new Date()
        });
        console.log('✅ FCM token saved to user profile');
      }
      
      return token;
    } else {
      console.log('❌ No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    
    // Check specific error types
    if (error.code === 'messaging/permission-blocked') {
      console.error('❌ Notification permission blocked by user');
    } else if (error.code === 'messaging/registration-token-not-subscribed-yet') {
      console.log('⚠️  Token not subscribed yet, will retry');
    }
    
    return null;
  }
}

/**
 * Listen for foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export function listenForForegroundMessages(callback) {
  try {
    const messaging = getMessaging();
    
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      
      // Call callback with structured data
      callback({
        title: payload.notification?.title || 'Raksetu Notification',
        body: payload.notification?.body || '',
        data: payload.data || {},
        image: payload.notification?.image
      });

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        const notificationTitle = payload.notification?.title || 'Raksetu';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/Raksetu.png',
          badge: '/Raksetu.png',
          tag: payload.data?.emergencyId || 'notification',
          data: payload.data
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
  }
}

/**
 * Disable notifications for user
 * @param {string} userId - Current user ID
 */
export async function disableNotifications(userId) {
  try {
    if (!userId) return;

    await updateDoc(doc(db, 'users', userId), {
      notificationsEnabled: false,
      fcmToken: null
    });

    console.log('✅ Notifications disabled for user');
  } catch (error) {
    console.error('Error disabling notifications:', error);
  }
}

/**
 * Update notification preferences
 * @param {string} userId - Current user ID
 * @param {Object} preferences - Notification preferences
 */
export async function updateNotificationPreferences(userId, preferences) {
  try {
    if (!userId) return;

    await updateDoc(doc(db, 'users', userId), {
      notificationPreferences: {
        emergencies: preferences.emergencies ?? true,
        donations: preferences.donations ?? true,
        reminders: preferences.reminders ?? true,
        news: preferences.news ?? false,
        ...preferences
      }
    });

    console.log('✅ Notification preferences updated');
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
}

/**
 * Get user's notification preferences
 * @param {string} userId - Current user ID
 * @returns {Promise<Object>} Notification preferences
 */
export async function getNotificationPreferences(userId) {
  try {
    if (!userId) return null;

    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    return userData?.notificationPreferences || {
      emergencies: true,
      donations: true,
      reminders: true,
      news: false
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

/**
 * Test notification (for debugging)
 */
export function testNotification() {
  if (Notification.permission === 'granted') {
    new Notification('🩸 Raksetu Test', {
      body: 'Push notifications are working correctly!',
      icon: '/Raksetu.png',
      badge: '/Raksetu.png'
    });
  } else {
    console.log('Notification permission not granted');
  }
}

export default {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  listenForForegroundMessages,
  disableNotifications,
  updateNotificationPreferences,
  getNotificationPreferences,
  testNotification
};
