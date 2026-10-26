/**
 * sw.js - Progressive Web App Service Worker (v2.0)
 * Cache Name: access-portal-v2
 * Strategy: Cache-First for static assets, Network-First for HTML navigations,
 * dynamic CDN caching, and comprehensive offline fallback resilience.
 */

const CACHE_NAME = 'access-portal-v2';

// Core local application resources to cache immediately on install
const CRITICAL_ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './goku.html',
    './vegeta.css',
    './manifest.json',
    './styles/vegeta.css',
    './styles/particles.css',
    './script.js',
    './js/script.js',
    './js/validators.js',
    './js/security.js',
    './js/notifications.js',
    './js/auth-service.js',
    './js/theme-engine.js',
    './js/cep-service.js',
    './js/dashboard.js',
    './js/dashboard-charts.js',
    './js/password-recovery.js',
    './js/export-service.js',
    './tests/index.html',
    './tests/unit-tests.js'
];

// Offline HTML fallback banner/template
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modo Offline — Portal de Acesso</title>
    <style>
        body {
            background-color: #0b0f19;
            color: #f8fafc;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .offline-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 36px 28px;
            max-width: 460px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .icon { font-size: 3rem; margin-bottom: 16px; }
        h2 { margin: 0 0 12px 0; color: #60a5fa; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }
        .btn-retry {
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-retry:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="offline-card">
        <div class="icon">📡</div>
        <h2>Você está offline</h2>
        <p>Não foi possível carregar a página solicitada. Os recursos essenciais do Portal de Acesso estão preservados localmente.</p>
        <button class="btn-retry" onclick="window.location.reload()">Tentar Novamente</button>
    </div>
</body>
</html>`;

// --- 1. INSTALL LIFECYCLE ---
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Use Promise.allSettled so a single missing optional asset does not abort installation
            await Promise.allSettled(
                CRITICAL_ASSETS.map(url =>
                    cache.add(url).catch(err => {
                        console.warn(`[ServiceWorker] Falha ao pré-carregar recurso: ${url}`, err);
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

// --- 2. ACTIVATE LIFECYCLE ---
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((oldKey) => {
                    console.log(`[ServiceWorker] Purgando cache antigo: ${oldKey}`);
                    return caches.delete(oldKey);
                })
            );
        })
    );
    self.clients.claim();
});

// --- 3. FETCH STRATEGY ---
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests and browser extensions
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
        return;
    }

    // A. Navigation requests (HTML documents) -> Network-First with Cache and Offline Fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Try index.html from cache
                    const fallbackIndex = await caches.match('./index.html');
                    if (fallbackIndex) {
                        return fallbackIndex;
                    }
                    // Return raw offline HTML fallback
                    return new Response(OFFLINE_FALLBACK_HTML, {
                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
                    });
                })
        );
        return;
    }

    // B. Static Assets (CSS, JS, Images, Fonts, CDNs) -> Cache-First with Network Fallback
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Fetch in background to revalidate stale cache (Stale-While-Revalidate pattern)
                fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                        }
                    })
                    .catch(() => {});
                return cachedResponse;
            }

            // Not in cache: fetch from network and store in cache
            return fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Fail gracefully for images or non-critical assets
                    if (request.destination === 'image') {
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#1e293b"/></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    }
                    return new Response('Offline: Recurso indisponível', { status: 503, statusText: 'Offline' });
                });
        })
    );
});
