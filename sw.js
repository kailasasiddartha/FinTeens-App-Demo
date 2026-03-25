// FinTeens Service Worker for PWA support
const CACHE_NAME = 'finteens-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/constants.js',
    '/state.js',
    '/utils.js',
    '/trading.js',
    '/quiz.js',
    '/finance.js',
    '/learning.js',
    '/main.js',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('FinTeens: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('FinTeens: Cache failed', err))
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses or non-GET requests
                        if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
                            return response;
                        }
                        // Clone and cache the response
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
            .catch(() => {
                // Return offline fallback if available
                return caches.match('/index.html');
            })
    );
});

// Push event - handle notifications
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'FinTeens Arena', body: 'Market movement detected! 📈' };
    const options = {
        body: data.body,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge.png',
        vibrate: [100, 50, 100],
        data: { url: '/' }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
