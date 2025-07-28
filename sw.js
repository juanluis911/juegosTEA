// 🔧 Service Worker para JuegoTEA PWA
const CACHE_NAME = 'juegotea-v1.0.0';
const STATIC_CACHE = 'juegotea-static-v1.0.0';
const DYNAMIC_CACHE = 'juegotea-dynamic-v1.0.0';

// Recursos críticos que se cachean inmediatamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // CSS
  '/css/main.css',
  '/css/index.css',
  '/css/categories.css',
  '/css/games.css',
  
  // JavaScript
  '/js/main.js',
  '/js/index.js',
  '/js/categories.js',
  '/js/games.js',
  '/js/pwa-install.js',
  
  // Páginas principales
  '/categorias/comunicacion-lenguaje.html',
  
  // Íconos críticos
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  
  // Offline fallback
  '/offline.html'
];

// URLs que NO deben ser cacheadas
const EXCLUDE_FROM_CACHE = [
  /*'/api/',*/
  '/subscription/create',
  '/webhook',
  'mercadopago.com',
  'mercadolibre.com'
];

// Recursos que se cachean bajo demanda
const DYNAMIC_ASSETS = [
  '/categorias/',
  '/juegos/',
  '/assets/'
];

// === INSTALACIÓN ===
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// === ACTIVACIÓN ===
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// === INTERCEPTACIÓN DE REQUESTS ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // NO cachear requests POST, PUT, DELETE, PATCH
  if (request.method !== 'GET') {
    console.log(`🚫 Service Worker: Skipping non-GET request: ${request.method} ${url.pathname}`);
    return;
  }

  // NO cachear URLs excluidas
  const shouldExclude = EXCLUDE_FROM_CACHE.some(pattern => 
    url.pathname.includes(pattern) || url.hostname.includes(pattern)
  );

  if (shouldExclude) {
    console.log(`🚫 Service Worker: Skipping excluded URL: ${url.pathname}`);
    return;
  }

  // Para archivos estáticos: Cache First
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Para APIs: Network First (solo GET)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Para todo lo demás: Cache First con fallback
  event.respondWith(cacheFirstWithFallback(request));
});

// === ESTRATEGIAS DE CACHE ===

// Verificar si es un asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`🎯 Cache hit: ${request.url}`);
      return cachedResponse;
    }

    console.log(`🌐 Fetching from network: ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error(`❌ Cache First failed: ${request.url}`, error);
    return new Response('Recurso no disponible offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    console.log(`🌐 Network first: ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log(`📦 Fallback to cache: ${request.url}`);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    console.error(`❌ Network First failed: ${request.url}`, error);
    return new Response('API no disponible offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Estrategia Cache First con fallback a offline
async function cacheFirstWithFallback(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`🎯 Cache hit: ${request.url}`);
      return cachedResponse;
    }

    console.log(`🌐 Fetching from network: ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error(`❌ Request failed: ${request.url}`, error);
    
    // Fallback a página offline para navegación
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Contenido no disponible offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// === NOTIFICACIONES PUSH ===
self.addEventListener('push', (event) => {
  console.log('📬 Push message received');
  
  const options = {
    title: 'JuegoTEA',
    body: event.data ? event.data.text() : 'Nueva actualización disponible',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explorar',
        icon: '/assets/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('JuegoTEA', options)
  );
});

// === CLICKS EN NOTIFICACIONES ===
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
    return;
  } else {
    // Click en el cuerpo de la notificación
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// === BACKGROUND SYNC ===
self.addEventListener('sync', function(event) {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Ejecutando sincronización en segundo plano');
  // Implementar sincronización si es necesario
}

// === MANEJO DE ERRORES ===
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});

console.log('🎮 JuegoTEA Service Worker loaded successfully');