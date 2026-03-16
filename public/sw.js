self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Keep service worker control active for installability checks while using network-first.
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {
    title: 'GrupoFlow',
    body: 'Tienes una nueva notificacion',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    url: '/',
  }

  try {
    payload = { ...payload, ...event.data.json() }
  } catch (error) {
    // Ignore malformed payloads and use defaults.
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    data: {
      url: payload.url || '/',
    },
  }

  event.waitUntil(self.registration.showNotification(payload.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification?.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }

      return Promise.resolve()
    })
  )
})
