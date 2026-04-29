const CACHE_NAME = 'canchapro-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (event.request.mode === 'navigate') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/.test(url.pathname)
  if (!isStaticAsset) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
    })
  )
})
