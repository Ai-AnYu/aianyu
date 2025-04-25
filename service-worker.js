const CACHE_NAME = 'ai-anhao-cache-v1'; // Increment version if significant changes
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/tokenplan.html', // Add the new HTML page
  '/img/aianyu1024x1024.png', // Cache the logo (assuming path is correct)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png',
  // Cache all icon SVGs used in the UI
  '/icons/chinese.svg',
  '/icons/aianyu.svg',
  '/icons/magnet.svg',
  '/icons/wallet.svg',
  '/icons/link.svg',
  '/icons/telegram.svg',
  '/icons/id.svg',
  '/icons/topic.svg',
  '/icons/grok.svg',
  '/icons/doubao.svg',
  '/icons/deepseek.svg',
  '/icons/apikey.svg',
  '/icons/go.svg',
  '/icons/Letters.svg',
  '/icons/token.svg', // Add the new icon SVG
   // Add other essential assets if any
   // Be cautious caching external resources like Google Fonts if offline use is critical
   //'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' // Example: Caching external font CSS - Use with caution
];

// Install event: open cache and add assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll for atomic caching, but implement fallback for individual failures
        const promises = urlsToCache.map(url => {
            return cache.add(url).catch(error => {
                console.warn(`Failed to cache ${url} during install:`, error);
                // Attempt to fetch and cache individually, handling potential CORS/network issues
                return fetch(url, { mode: 'cors' }) // Use 'cors' by default, adjust if needed for specific resources
                    .then(response => {
                        // Handle non-200 responses carefully
                        if (!response.ok) {
                            // For external resources like Google Fonts, 'opaque' responses might be okay if needed
                            if (response.type === 'opaque' && url.includes('googleapis.com')) {
                                console.log(`Caching opaque response for ${url}`);
                                return cache.put(url, response);
                            }
                             // Otherwise, log the failure for non-essential assets
                             console.warn(`Failed to fetch ${url} for cache: Status ${response.status}`);
                             return; // Don't cache failed non-essential resources
                        }
                        // Cache successful responses
                        return cache.put(url, response);
                    })
                    .catch(fetchError => {
                         console.error(`Failed to fetch and cache ${url} individually:`, fetchError);
                         // Don't let a single failure stop the whole install unless critical
                         // If a resource is absolutely critical, you might want to throw here
                     });
            });
        });
        return Promise.all(promises);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
      .catch(err => {
          console.error("Cache installation failed:", err); // Log if overall caching fails
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache version
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open clients
  );
});

// Fetch event: serve cached assets or fetch from network
self.addEventListener('fetch', event => {
    // Skip caching API requests (POST requests to AI providers)
    // Improved check for common API paths
    const isApiRequest = event.request.method === 'POST' && /\/(v1|v3)\/(chat\/completions|api)/.test(event.request.url);
    if (isApiRequest) {
        event.respondWith(fetch(event.request));
        return;
    }

     // Cache-first strategy for other requests (mainly GET)
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Not in cache - fetch from network
            return fetch(event.request).then(
            networkResponse => {
                // Check if we received a valid response
                 // Allow caching opaque responses for specific external resources if offline use is desired
                 const isValidResponse = networkResponse && networkResponse.ok;
                 const isOpaqueFont = networkResponse.type === 'opaque' && event.request.url.includes('googleapis'); // Example for fonts

                 if (!isValidResponse && !isOpaqueFont) {
                     // Don't cache invalid or non-essential opaque responses
                     if(networkResponse) {
                         console.warn(`Not caching invalid response for ${event.request.url}: Status ${networkResponse.status}`);
                     } else {
                          console.warn(`Not caching - fetch returned no response for ${event.request.url}`);
                     }
                     return networkResponse;
                 }

                // Clone the response. A response is a stream.
                const responseToCache = networkResponse.clone();

                // Cache the new response for future use
                 caches.open(CACHE_NAME)
                 .then(cache => {
                    // Only cache GET requests or specifically allowed opaque responses
                    if(event.request.method === 'GET') {
                         cache.put(event.request, responseToCache).catch(putError => {
                             console.error(`Failed to cache ${event.request.url}:`, putError);
                         });
                    }
                 });

                return networkResponse;
            }
            ).catch(error => {
                console.error('Network fetch failed:', error, event.request.url);
                // Optional: Return a fallback offline page/resource if fetch fails entirely
                // Example: Check if the request accepts HTML and return an offline page
                // if (event.request.headers.get('accept').includes('text/html')) {
                //     return caches.match('/offline.html'); // Make sure offline.html is cached
                // }
                // For now, just let the browser handle the network error
                 // throw error; // Re-throwing might break the app offline
            });
        })
    );
});