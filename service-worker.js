const CACHE_NAME = 'ai-anhao-cache-v1'; // Increment version if significant changes
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/pages/tokenplan.html', // Add the new HTML page
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
        // For API requests, always go to the network
        event.respondWith(fetch(event.request));
        return;
    }

    // --- START MODIFICATION ---
    // Network-first strategy for navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
            .then(networkResponse => {
                // Check if we received a valid response (status 200 OK)
                if (networkResponse && networkResponse.ok) {
                    // Clone the response to cache it for offline use
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache).catch(putError => {
                            console.error(`Failed to cache navigation request ${event.request.url}:`, putError);
                        });
                    });
                } else if (networkResponse) {
                     // Log if the network response wasn't ok, but still return it
                     console.warn(`Network fetch for navigation ${event.request.url} failed with status ${networkResponse.status}. Not caching.`);
                }
                // Return the network response directly (even if not ok, let browser handle errors)
                return networkResponse;
            })
            .catch(error => {
                // Network fetch failed (e.g., offline)
                console.warn(`Network fetch failed for navigation ${event.request.url}. Trying cache.`, error);
                // Try to serve the page from the cache as a fallback
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse; // Serve from cache if available
                        }
                        // Optional: If you have a specific offline page cached, you could return it here
                        // return caches.match('/offline.html');
                        // If no cache match, let the browser show its default offline error
                        // Re-throwing the error ensures the browser knows the fetch failed
                        throw error;
                    });
            })
        );
        return; // Important: Stop further processing for navigation requests
    }
    // --- END MODIFICATION ---


    // Cache-first strategy for all other requests (CSS, JS, images, fonts, etc.)
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return response from cache
            if (response) {
                return response;
            }

            // Not in cache - fetch from network
            return fetch(event.request).then(
                networkResponse => {
                    // Check if we received a valid response to cache
                    // Allow caching valid responses (ok) and specific opaque responses (like fonts)
                    const isValidResponse = networkResponse && networkResponse.ok;
                    const isOpaqueFont = networkResponse.type === 'opaque' && event.request.url.includes('googleapis'); // Example check for Google Fonts

                    if (!isValidResponse && !isOpaqueFont) {
                        // Don't cache invalid or non-essential opaque responses
                        if(networkResponse) {
                            console.warn(`Not caching invalid response for ${event.request.url}: Status ${networkResponse.status}`);
                        } else {
                             console.warn(`Not caching - fetch returned no response for ${event.request.url}`);
                        }
                        return networkResponse; // Return the problematic response anyway
                    }

                    // Clone the response because it needs to be used by the cache and the browser.
                    const responseToCache = networkResponse.clone();

                    // Cache the new valid response for future use
                    caches.open(CACHE_NAME)
                    .then(cache => {
                        // Only cache GET requests or specifically allowed opaque responses
                        if(event.request.method === 'GET') {
                            cache.put(event.request, responseToCache).catch(putError => {
                                console.error(`Failed to cache ${event.request.url}:`, putError);
                            });
                        }
                    });

                    // Return the original network response to the browser
                    return networkResponse;
                }
            ).catch(error => {
                console.error('Network fetch failed for non-navigation asset:', error, event.request.url);
                // Optional: Provide fallback for assets if needed (e.g., placeholder image)
                // For now, just let the browser handle the network error for assets
                throw error; // Re-throw to indicate failure
            });
        })
    );
});
