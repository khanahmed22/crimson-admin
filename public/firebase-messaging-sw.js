/* firebase-messaging-sw.js */

importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDYC4eTX1p8Lk-dvR61tnWZk0aYyI6hgv8",
  authDomain: "crimson-castle.firebaseapp.com",
  projectId: "crimson-castle",
  storageBucket: "crimson-castle.firebasestorage.app",
  messagingSenderId: "558981554645",
  appId: "1:558981554645:web:fe9d36bb829c21a9795d5c",
});

// REQUIRED: initialize messaging
firebase.messaging();

/*
  DO NOT add:
  - messaging.onBackgroundMessage
  - showNotification
  - custom handlers

  FCM will auto-display notifications
  when backend sends a `notification` payload.
*/

// Optional: handle click navigation (recommended)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.link || "/live-orders";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
