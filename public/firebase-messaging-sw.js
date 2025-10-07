/**
 * Firebase Cloud Messaging Configuration
 * Service Worker for background push notifications
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase (use your actual config)
firebase.initializeApp({
  apiKey: "AIzaSyCGTt2bxcMnlIk9SxbPo4PINx91Y3g1R8s",
  authDomain: "blooddonationapp-bf4a7.firebaseapp.com",
  projectId: "blooddonationapp-bf4a7",
  storageBucket: "blooddonationapp-bf4a7.firebasestorage.app",
  messagingSenderId: "730730941993",
  appId: "1:730730941993:web:0dac86f40fc38b2dc2c1a2",
  measurementId: "G-TSJCJZS03G"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || '🚨 Emergency Blood Request';
  const notificationOptions = {
    body: payload.notification?.body || 'Someone needs your blood type urgently!',
    icon: '/Raksetu.png',
    badge: '/Raksetu.png',
    image: payload.notification?.image,
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.data?.emergencyId || 'emergency',
    requireInteraction: true,
    actions: [
      {
        action: 'respond',
        title: '❤️ Respond Now',
        icon: '/Raksetu.png'
      },
      {
        action: 'view',
        title: '👁️ View Details'
      },
      {
        action: 'dismiss',
        title: '✖️ Dismiss'
      }
    ],
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'respond' || event.action === 'view') {
    // Open app and navigate to emergency
    const emergencyId = event.notification.data?.emergencyId;
    const urlToOpen = emergencyId 
      ? `${self.location.origin}/?emergency=${emergencyId}`
      : self.location.origin;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle push event
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    const title = data.notification?.title || 'Raksetu Blood Donation';
    const options = {
      body: data.notification?.body || 'New notification',
      icon: '/Raksetu.png',
      badge: '/Raksetu.png',
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error parsing push data:', error);
  }
});
