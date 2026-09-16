// Give the service worker access to Firebase Messaging.
// Note: We use the compat library since service workers do not natively support ES modules in older browsers.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyC08T62DUAZ8cvUXwXL8aNWVHoEvsccHd4",
  authDomain: "messagedrive4pass.firebaseapp.com",
  projectId: "messagedrive4pass",
  storageBucket: "messagedrive4pass.firebasestorage.app",
  messagingSenderId: "798903974665",
  appId: "1:798903974665:web:ce01e481d662293bd971d8",
  measurementId: "G-P4K2CYDXDL"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Safely extract notification title and options
  const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
