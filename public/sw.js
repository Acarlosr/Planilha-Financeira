// Service Worker — SaldoClaro PWA
// Estratégia: Cache-First para assets estáticos, Network-First para páginas e API

const CACHE_NAME = 'saldoclaro-v1';

// Assets estáticos que ficam em cache indefinidamente
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Prefixos de URL que nunca devem ser cacheados (sempre rede)
const NETWORK_ONLY = [
  '/api/',
  '/_next/webpack-hmr',
  '/auth/',
];

// ── Instalação: pré-cacheia assets estáticos ────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Ativação: limpa caches antigos ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: roteamento de cache ──────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET e outros origins
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Network-only: APIs e rotas de autenticação
  const isNetworkOnly = NETWORK_ONLY.some((prefix) => url.pathname.startsWith(prefix));
  if (isNetworkOnly) {
    event.respondWith(fetch(request));
    return;
  }

  // Assets estáticos Next.js (_next/static): Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Páginas HTML: Network-First com fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
