const CACHE_NAME = "himnario-ipu-v6"; // Incrementa la versión
const VERSION = "v6"; // Para tracking

const urlsToCache = [
    "./",
    "./index.html",
    "./styles.css",
    "./script.js",
    "./manifest.json"
];

// INSTALAR NUEVA VERSION
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// ACTIVAR Y LIMPIAR VERSIONES ANTIGUAS
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
        .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if(cache !== CACHE_NAME){
                        return caches.delete(cache);
                    }
                })
            );
        })
        .then(() => {
            // Notificar a los clientes que se ha actualizado
            return self.clients.claim();
        })
    );
});

// PETICIONES
self.addEventListener("fetch", event => {
    // Para los JSON siempre buscar la versión nueva
    if(event.request.url.includes(".json")){
        event.respondWith(
            fetch(event.request, { cache: 'no-store' })
            .catch(() => caches.match(event.request))
        );
        return;
    }

    // Para archivos normales usar caché
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            return response || fetch(event.request);
        })
    );
});

// MENSAJES DESDE LA APP
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});