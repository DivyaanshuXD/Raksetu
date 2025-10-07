import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const addEmergencyNotification = async (emergencyRequest) => {
  try {
    const notificationMessage = `${
      emergencyRequest.urgency || 'Unknown urgency'
    } urgency emergency request by ${emergencyRequest.patientName || 'unknown patient'} at ${
      emergencyRequest.hospital || 'unknown hospital'
    }: ${emergencyRequest.message || 'Click to view details'}`;
    
    console.log('Creating emergency notification:', notificationMessage);
    const docRef = await addDoc(collection(db, 'notifications'), {
      type: 'emergency',
      message: notificationMessage,
      emergencyId: emergencyRequest.id,
      createdAt: serverTimestamp(),
      readBy: []
    });
    console.log('Emergency notification created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding emergency notification:', error);
    throw error;
  }
};

// ML Re-engagement notification (created by backend)
export const listenForUserNotifications = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  // Listen to user-specific notifications (including ML re-engagement)
  const userNotificationsQuery = query(
    collection(db, 'notifications'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(userNotificationsQuery, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Include notifications for this user or global notifications
      if (!data.userId || data.userId === userId) {
        notifications.push({ id: doc.id, ...data });
      }
    });
    console.log('User notifications received:', notifications.length);
    callback(notifications);
  }, (error) => {
    if (error.code === 'permission-denied') {
      console.log('ℹ️ [Notifications] Not logged in - notifications disabled');
      callback([]);
    } else {
      console.error('Error listening for notifications:', error);
      callback([]);
    }
  });
};

export const listenForNotifications = (callback) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    console.log('Notifications snapshot received:', notifications);
    callback(notifications);
  }, (error) => {
    // Silently handle permission errors for unauthenticated users
    if (error.code === 'permission-denied') {
      console.log('ℹ️ [Notifications] Not logged in - notifications disabled');
      callback([]);
    } else {
      console.error('Error listening for notifications:', error);
      callback([]);
    }
  });
};