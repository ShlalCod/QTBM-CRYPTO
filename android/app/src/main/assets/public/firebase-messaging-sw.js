/**
 * QTBM CRYPTO - Firebase Messaging Service Worker
 * Handles background push notifications for the PWA / Android wrapper.
 */

importScripts("https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCjsrjak2u8J0b6rfaqrB-NZmc1apI70JI",
  authDomain: "qtb-bank-crypto.firebaseapp.com",
  databaseURL:
    "https://qtb-bank-crypto-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "qtb-bank-crypto",
  storageBucket: "qtb-bank-crypto.firebasestorage.app",
  messagingSenderId: "506536686458",
  appId: "1:506536686458:android:cb8e1888f30ea8a1ac1cc3",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title ?? "QTBM CRYPTO";
  const notificationOptions = {
    body: payload.notification?.body ?? "",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    data: payload.data ?? {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return null;
      })
  );
});
