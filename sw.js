/**
 * sw.js
 * Service Worker für Offline-Caching der Ballistik & Schießbuch PWA (Version 0.1).
 * WICHTIG: Wetter-API-Anfragen (z. B. Open-Meteo) werden NIEMALS gecacht,
 * sondern immer direkt aus dem Netzwerk geladen.
 */

const CACHE_NAME = 'sniper-v0.1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './ballistics.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installation: Statische App-Dateien in den Cache legen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktivierung: Alte Cache-Versionen bereinigen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch-Strategie:
// 1. Wetter-API (Open-Meteo oder andere Wetter-Endpunkte) niemals cachen -> immer Netzwerk
// 2. Lokale / statische Ressourcen -> Cache-First mit Netzwerk-Fallback und Cache-Update
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Wetter-API niemals cachen, immer aus dem Netz laden
  if (
    url.hostname.includes('open-meteo.com') ||
    url.pathname.includes('/weather') ||
    url.searchParams.has('temperature_2m')
  ) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' }))
    );
    return;
  }

  // Nur gleiche Origin cachen, damit externe Links/APIs sauber bleiben
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});