/**
 * sw.js - Service Worker for Portal de Acesso
 * Caches static files and enables offline resilience.
 */
const CACHE_NAME = 'portal-acesso-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './goku.html',
  './dashboard.html',
  './vegeta.css',
  './styles/particles.css',
  './js/validators.js',
  './js/security.js',
  './js/notifications.js',
  './js/auth-service.js',
  './js/theme-engine.js',
  './js/cep-service.js',
  './js/dashboard.js',
  './js/dashboard-charts.js',
  './js/export-service.js',
  './script.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => cachedResponse);
    })
  );
});