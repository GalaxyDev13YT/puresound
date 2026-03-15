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
  const isDriveMedia =
    url.hostname === "www.googleapis.com" &&
    url.pathname.startsWith("/drive/v3/files/") &&
    url.searchParams.get("alt") === "media";

  if (!isDriveMedia) return;

  event.respondWith(cacheFirst(request));
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
