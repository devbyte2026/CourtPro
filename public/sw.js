const CACHE_NAME = 'canchapro-v1'
const STATIC_ASSETS = ['/manifest.json']

const EXCLUDED_PATHS = [
  '/admin/reset-password',
  '/api/',
  '/login',
  '/signup',
  '/forgot-password',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  const isExcluded = EXCLUDED_PATHS.some(path => url.pathname.startsWith(path))
  if (isExcluded) return

  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
