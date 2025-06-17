// firebase-messaging-sw.js
// Place this file in your public/ directory

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Your Firebase config (same as in your main app)
const firebaseConfig = {
  apiKey: "AIzaSyAMo7A1Fs35EAyjWmz-5CiywItpiLbLYWQ",
  authDomain: "masterman-utah.firebaseapp.com", 
  projectId: "masterman-utah",
  storageBucket: "masterman-utah.firebasestorage.app",
  messagingSenderId: "273247400644",
  appId: "1:273247400644:web:f9d08c21f0a779526d4f91"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new message',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: payload.data?.type || 'brotherhood-notification',
    data: payload.data,
    requireInteraction: payload.data?.urgent === 'true',
    actions: payload.data?.type === 'dua_request' ? [
      { action: 'pray', title: '🤲 Make Dua' },
      { action: 'view', title: 'View Details' }
    ] : []
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event.action);
  
  event.notification.close();
  
  // Route based on notification type
  const data = event.notification.data || {};
  let url = '/';
  
  switch (data.type) {
    case 'dua_request':
      url = event.action === 'pray' ? '/duas' : `/duas/${data.duaId || ''}`;
      break;
    case 'goal_reminder':
      url = '/goals';
      break;
    case 'contact_reminder':
      url = '/brotherhood';
      break;
    case 'announcement':
      url = '/announcements';
      break;
    default:
      url = '/';
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});