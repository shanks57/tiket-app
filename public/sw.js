const APP_VERSION = '__APP_VERSION__';
const CACHE_NAME = `siperkasa-${APP_VERSION}`;
const STATIC_CACHE = `siperkasa-static-${APP_VERSION}`;
const DYNAMIC_CACHE = `siperkasa-dynamic-${APP_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/offline',
    '/offline.html',
    '/site.webmanifest',
    '/build/manifest.json',
    '/build/assets/app.css',
    '/build/assets/app.js',
    '/assets/android/android-launchericon-192-192.png',
    '/assets/android/android-launchericon-512-512.png',
    '/assets/ios/192.png',
    '/assets/ios/512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('[SW] Error caching static assets:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (!url.origin.includes(self.location.origin)) return;

    // Handle API requests differently
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached API response if available
                    return caches.match(request);
                })
        );
        return;
    }

    // Handle navigation requests (pages) - ALWAYS Network First
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Update the cache with the newest version
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/offline');
                    });
                })
        );
        return;
    }

    // Handle static assets (images, fonts, scripts) - Cache First
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Don't cache non-successful responses or non-basic types
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Cache static assets (like JS/CSS from build)
                const url = new URL(request.url);
                if (url.pathname.startsWith('/build/') || url.pathname.startsWith('/assets/')) {
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }

                return response;
            });
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Handle offline actions that need to be synced
    console.log('[SW] Performing background sync');
    // This could be extended to sync offline ticket submissions, comments, etc.
}

// Push notifications (web-push)
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');

    if (!event.data) {
        console.log('[SW] Push received but no data');
        return;
    }

    try {
        const data = event.data ? event.data.json() : {};
        console.log('[SW] Push data:', data);

        // Try to get title and body from various possible paths
        const title = data.title ||
            (data.notification ? data.notification.title : null) ||
            'SIPERKASA APP';

        const body = data.body ||
            (data.notification ? data.notification.body : null) ||
            'Anda memiliki notifikasi baru';

        const options = {
            body: body,
            icon: data.icon || (data.notification ? data.notification.image : null) || '/assets/android/android-launchericon-192-192.png',
            badge: data.badge || '/assets/android/android-launchericon-96-96.png',
            image: data.image || (data.data ? data.data.image : null) || undefined,
            vibrate: [200, 100, 200],
            tag: data.tag || 'notification-' + Date.now(),
            requireInteraction: true,
            data: {
                dateOfArrival: Date.now(),
                url: data.url || (data.data ? data.data.url : null) || '/dashboard',
            }
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('[SW] Error processing push:', error);
        const text = event.data ? event.data.text() : 'Notifikasi Baru';
        event.waitUntil(
            self.registration.showNotification('Notifikasi', {
                body: text,
                icon: '/assets/android/android-launchericon-192-192.png',
            })
        );
    }
});

// Handle notification clicks and actions
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);

    event.notification.close();

    const urlToOpen = event.notification.data.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not open, open it
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});