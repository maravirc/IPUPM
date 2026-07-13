const CACHE_NAME = "himnario-ipu-v19"; // Cambia la versión cuando actualices
const VERSION = "v19";

// 📁 CORREGIDO: La ruta de los JSON debe ser data/
const urlsToCache = [
    "./",
    "./index.html",
    "./styles.css",
    "./script.js",
    "./manifest.json",
    "./data/himnos.json",    // ← CORREGIDO: antes era "./himnos.json"
    "./data/coros.json"      // ← NUEVO: agregar coros
];

// INSTALAR NUEVA VERSION
self.addEventListener("install", event => {
    console.log(`[SW] Instalando versión ${VERSION}`);
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log("[SW] Cacheando archivos...");
            return cache.addAll(urlsToCache);
        })
        .then(() => {
            console.log("[SW] Instalación completada");
            return self.skipWaiting();
        })
    );
});

// ACTIVAR Y LIMPIAR VERSIONES ANTIGUAS
self.addEventListener("activate", event => {
    console.log(`[SW] Activando versión ${VERSION}`);
    event.waitUntil(
        caches.keys()
        .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("[SW] Eliminando caché antiguo:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
        .then(() => {
            console.log("[SW] Activación completada");
            return self.clients.claim();
        })
    );
});

// PETICIONES - CORREGIDO PARA FUNCIONAR SIN INTERNET
self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    
    // Para los JSON - PRIMERO BUSCAR EN CACHÉ
    if (event.request.url.includes(".json")) {
        event.respondWith(
            caches.match(event.request)
            .then(cachedResponse => {
                // Si está en caché, devolverlo
                if (cachedResponse) {
                    console.log(`[SW] JSON desde caché: ${url.pathname}`);
                    return cachedResponse;
                }
                // Si no está en caché, buscar en red
                return fetch(event.request, { cache: 'no-store' })
                .then(networkResponse => {
                    // Guardar en caché para futuras veces
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    return networkResponse;
                })
                .catch(() => {
                    console.error(`[SW] Error al cargar JSON: ${url.pathname}`);
                    // Devolver JSON vacío en caso de error
                    return new Response(JSON.stringify([]), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            })
        );
        return;
    }

    // Para archivos normales - PRIMERO BUSCAR EN CACHÉ
    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            // Si no está en caché, buscar en red
            return fetch(event.request)
            .then(networkResponse => {
                // Guardar en caché para futuras veces
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                return networkResponse;
            });
        })
    );
});

// MENSAJES DESDE LA APP
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

console.log(`[SW] Service Worker ${VERSION} cargado`);