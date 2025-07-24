// 🔧 Service Worker Mejorado para JuegoTEA PWA
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
  
  // Páginas principales
  '/categorias/comunicacion-lenguaje.html',
  
  // Íconos críticos
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  
  // Offline fallback
  '/offline.html'
];

// Recursos que se cachean bajo demanda
const DYNAMIC_ASSETS = [
  '/categorias/',
  '/juegos/',
  '/assets/'
];

// === INSTALACIÓN ===
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pre-cache crítico
      caches.open(CACHE_NAME).then(cache => {
        console.log('⚡ Pre-cacheando recursos críticos');
        return cache.addAll([
          '/',
          '/css/main.css',
          '/js/main.js'
        ]);
      })
    ]).then(() => {
      console.log('✅ Service Worker instalado correctamente');
      // Forzar activación inmediata
      return self.skipWaiting();
    })
  );
});

// === ACTIVACIÓN ===
self.addEventListener('activate', function(event) {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar control inmediato
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado y en control');
    })
  );
});

// === FETCH - ESTRATEGIAS DE CACHE ===
self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  // Estrategia basada en el tipo de recurso
  if (isStaticAsset(url.pathname)) {
    // Cache First para recursos estáticos
    event.respondWith(cacheFirst(request));
  } else if (isHTMLPage(url.pathname)) {
    // Network First para páginas HTML
    event.respondWith(networkFirst(request));
  } else if (isAPICall(url.pathname)) {
    // Network Only para APIs
    event.respondWith(networkOnly(request));
  } else {
    // Stale While Revalidate para otros recursos
    event.respondWith(staleWhileRevalidate(request));
  }
});

// === ESTRATEGIAS DE CACHE ===

// Cache First - Para recursos estáticos (CSS, JS, imágenes)
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    const fresh = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, fresh.clone());
    
    return fresh;
  } catch (error) {
    console.log('❌ Cache First falló:', error);
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Network First - Para páginas HTML
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, fresh.clone());
    
    return fresh;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Fallback a página offline
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Página no disponible offline', { status: 503 });
  }
}

// Network Only - Para APIs
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response('API no disponible offline', { 
      status: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Offline', message: 'API no disponible' })
    });
  }
}

// Stale While Revalidate - Para otros recursos
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fresh = fetch(request).then(response => {
    const cache = caches.open(DYNAMIC_CACHE);
    cache.then(c => c.put(request, response.clone()));
    return response;
  }).catch(() => cached);
  
  return cached || fresh;
}

// === UTILIDADES ===

function isStaticAsset(pathname) {
  return pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isHTMLPage(pathname) {
  return pathname.endsWith('.html') || pathname.endsWith('/') || !pathname.includes('.');
}

function isAPICall(pathname) {
  return pathname.startsWith('/api/') || pathname.includes('/api/');
}

// === MENSAJES ===
self.addEventListener('message', function(event) {
  console.log('📨 Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// === EVENTOS PWA ===

// Push notifications (para futuras implementaciones)
self.addEventListener('push', function(event) {
  console.log('📱 Push notification recibida');
  
  const options = {
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

// Background sync (para futuras implementaciones)
self.addEventListener('sync', function(event) {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronización en segundo plano
  console.log('🔄 Ejecutando sincronización en segundo plano');
}

// === MANEJO DE ERRORES ===
self.addEventListener('error', function(event) {
  console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('❌ Promise rechazada en Service Worker:', event.reason);
});

console.log('✅ Service Worker JuegoTEA cargado completamente');