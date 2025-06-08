import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const addEmergencyNotification = async (emergencyRequest) => {
  try {
    const notificationMessage = `${
      emergencyRequest.urgency || 'Unknown urgency'
    } urgency emergency request by ${emergencyRequest.patientName || 'unknown patient'} at ${
      emergencyRequest.hospital || 'unknown hospital'
    }: ${emergencyRequest.message || 'Click to view details'}`;
    
    console.log('Creating notification:', notificationMessage);
    const docRef = await addDoc(collection(db, 'notifications'), {
      type: 'emergency',
      message: notificationMessage,
      emergencyId: emergencyRequest.id,
      createdAt: serverTimestamp(),
      readBy: []
    });
    console.log('Notification created with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
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
    console.error('Error listening for notifications:', error);
  });
};