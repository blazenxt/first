/**
 * BlazeNXT Enterprise Service Worker
 * ====================================
 * Stale-while-revalidate offline caching strategy for sub-100ms loading speeds.
 * 
 * @module service-worker
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const CACHE_NAME = 'blazenxt-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    'index.html',
    'about.html',
    'projects.html',
    'contact.html',
    'admin.html',
    '404.html',
    'master.css',
    'animations.css',
    'utilities.css',
    'themes.css',
    'responsive.css',
    'config.js',
    'utils.js',
    'storage.js',
    'security.js',
    'api-manager.js',
    'ai-engine.js',
    'groq-integration.js',
    'openai-integration.js',
    'anthropic-integration.js',
    'google-integration.js',
    'performance-monitor.js',
    'analytics.js',
    'ui-core.js',
    'router.js',
    'app.js'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Pre-caching offline assets...');
                // Try caching assets; log warnings if specific files fail but don't halt installation
                return Promise.all(
                    ASSETS_TO_CACHE.map(url => {
                        return cache.add(url).catch(err => {
                            console.warn(`[Service Worker] Failed to cache asset: ${url}`, err);
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Purging old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Stale-while-revalidate approach)
self.addEventListener('fetch', event => {
    // Avoid caching non-GET requests or external API calls
    if (event.request.method !== 'GET' || event.request.url.includes('/api.') || event.request.url.includes('api.openai.com') || event.request.url.includes('api.groq.com')) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchedResponse = fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fail gracefully on network errors
                });

                return cachedResponse || fetchedResponse;
            });
        })
    );
});
