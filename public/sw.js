// Offline shell for St. Alder's: Student of the Year.
// Static build assets, posters, textures, fonts and icons: cache-first (they're content-hashed or stable).
// Pages: network-first, falling back to the last cached copy, then the cached hub.
// Never caches /api/* (scores must always hit the server).
const VERSION = 'sty-v1'
const SHELL = ['/season', '/', '/offline.html']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return

  const staticAsset = /^\/(_next\/static|posters|textures|fonts|icons)\//.test(url.pathname)
  if (staticAsset) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()))
        return res
      })),
    )
    return
  }

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()))
          return res
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline.html'))),
    )
  }
})
