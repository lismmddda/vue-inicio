const APP_SHELL_CACHE = 'app-shell-v2'
const DYNAMIC_CACHE = 'dynamic-cache-v2'


const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js'

]


self.addEventListener('install', event => {
  console.log('[SW] Instalando...')
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => {
        console.log('[SW] Cacheando App Shell')
        return cache.addAll(APP_SHELL_FILES)
      })
      .then(() => self.skipWaiting())
  )
})


self.addEventListener('activate', event => {
  console.log('[SW] Activado')
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== APP_SHELL_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[SW] Borrando cache viejo:', key)
            return caches.delete(key)
          }
        })
      )
    )
  )
  self.clients.claim()
})


self.addEventListener('fetch', event => {


  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)


  if (url.origin.includes('pokeapi.co')) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(cacheRes => {

        // Si existe en cache → usarlo
        if (cacheRes) return cacheRes

        // Si no existe → pedirlo a la red y cachearlo
        return fetch(event.request)
          .then(networkRes => {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, networkRes.clone())
              return networkRes
            })
          })
      })
      .catch(() => {
 
        return caches.match('/index.html')
      })
  )
})
