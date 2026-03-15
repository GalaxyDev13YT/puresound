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
  const request = event.request;
  if (!cachingEnabled || request.method !== "GET") return;

  const url = new URL(request.url);
  
  // Don't cache Google Drive API streams - let them pass through
  if (url.hostname === "www.googleapis.com" && url.pathname.startsWith("/drive/v3/files/")) {
    return; // Skip caching for these
  }

  // Only cache thumbnail and view requests from drive.google.com
  const isDriveThumb = url.hostname === "drive.google.com" && url.pathname.includes("thumbnail");
  const isDriveView = url.hostname === "drive.google.com" && url.searchParams.get("export") === "view";

  if (isDriveThumb || isDriveView) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone());
  }
  return response;
}
