const CACHE_NAME = "puresound-audio-v1";
let cachingEnabled = false;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SET_CACHING") {
    cachingEnabled = Boolean(data.enabled);
  }
  if (data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        if (event.source && event.source.postMessage) {
          event.source.postMessage({ type: "CACHE_CLEARED" });
        }
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  
  // Only cache Google Drive API audio streams
  const isDriveStream = url.hostname === "www.googleapis.com" && 
                        url.pathname.startsWith("/drive/v3/files/") && 
                        url.searchParams.get("alt") === "media";

  if (isDriveStream && cachingEnabled) {
    event.respondWith(cacheFirstWithFallback(event.request));
  }
});

async function cacheFirstWithFallback(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    
    if (response.ok || response.status === 206) {
      // Cache successful responses and partial content
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // If cache fails, just fetch directly
    return fetch(request);
  }
}
