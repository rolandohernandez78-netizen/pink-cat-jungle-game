/* ==========================================================================
   SERVICE WORKER - EL GATO ROSADO EN LA SELVA (JUEGO OFFLINE)
   ========================================================================== */

// IMPORTANTE: subir este número en cada actualización del juego. Es lo que
// obliga a los celulares que ya tenían una versión vieja guardada a botarla
// y pedir la nueva la próxima vez que abran el juego con internet.
const CACHE_NAME = 'pink-cat-jungle-v2';
const CORE_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

// Estrategia "red primero, caché de respaldo": con internet, el juego
// siempre pide la versión más reciente (así las actualizaciones se ven de
// inmediato); el caché solo se usa si el celular está realmente sin señal.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
