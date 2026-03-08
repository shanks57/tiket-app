importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// These values will be injected by the server or should be hardcoded if stable
// For maximum reliability, we use the compat version in service workers
firebase.initializeApp({
    apiKey: "AIzaSyBpqyX_UZR3ju7GZC7OJoRm0pAgpkKzeyA",
    authDomain: "siperkasaapp.firebaseapp.com",
    projectId: "siperkasaapp",
    storageBucket: "siperkasaapp.firebasestorage.app",
    messagingSenderId: "561606299801",
    appId: "1:561606299801:web:144b0f3d36f68ceabce808"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received: ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'SIPERKASA APP';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Anda memiliki notifikasi baru',
        icon: payload.notification?.image || payload.data?.icon || '/assets/android/android-launchericon-192-192.png',
        badge: '/assets/android/android-launchericon-96-96.png',
        data: {
            url: payload.data?.url || '/dashboard'
        },
        tag: 'notification-' + Date.now(),
        requireInteraction: true,
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
