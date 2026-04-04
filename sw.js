const CACHE_NAME = "puresound-media-v7";
let cachingEnabled = false;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("puresound-media-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SET_CACHING") {
    cachingEnabled = Boolean(data.enabled);
  }
  if (data.type === "CLEAR_CACHE") {
    event.waitUntil(caches.delete(CACHE_NAME));
  }
});

self.addEventListener("fetch", (event) => {
  if (!cachingEnabled || event.request.method !== "GET") return;
  if (!shouldCache(event.request)) return;
  event.respondWith(cacheFirst(event.request));
});

function shouldCache(request) {
  try {
    const url = new URL(request.url);
    const isSameOrigin = url.origin === self.location.origin;
    const isStaticAsset = isSameOrigin && ["document", "script", "style", "font"].includes(request.destination);
    const isDriveImage = request.destination === "image" && (
      url.hostname === "drive.google.com" ||
      url.hostname === "drive.usercontent.google.com" ||
      url.hostname.endsWith("googleusercontent.com")
    );
    const isProxyMetadata = isSameOrigin && url.pathname.startsWith("/api/");
    const isManifest = isSameOrigin && /(?:^|\/)library\.json$/i.test(url.pathname);
    return isStaticAsset || isDriveImage || isProxyMetadata || isManifest;
  } catch (error) {
    return false;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && (response.ok || response.type === "opaque" || response.status === 206)) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}
