// Vynora PWA Service Worker (Offline Shell & Fast Boot Cache)
const CACHE_NAME = 'vynora-pwa-v1'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          console.warn('[SW] Precache partial warning:', err)
        })
      })
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-http, YouTube iframes, Piped streams, and range requests
  if (!url.protocol.startsWith('http')) return
  if (event.request.headers.get('range')) return
  if (url.origin.includes('youtube') || url.origin.includes('googlevideo') || url.origin.includes('piped')) return

  // SPA navigation fallback: when offline, serve /index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/')
      })
    )
    return
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone).catch(() => {})
          })
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

