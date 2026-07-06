const CACHE_NAME = "himnario-ipu-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./data/himnos.json"
];

// INSTALAR CACHE
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
  );
});

// INTERCEPTAR PETICIONES
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      return response || fetch(event.request);
    })
  );
});