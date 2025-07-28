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

// URLs que NO deben ser cacheadas
const EXCLUDE_FROM_CACHE = [
  '/api/',
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
    caches.open(CACHE_NAME)
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
// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
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

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // NO cachear requests POST, PUT, DELETE, PATCH
  if (request.method !== 'GET') {
    console.log(`🚫 Service Worker: Skipping non-GET request: ${request.method} ${url.pathname}`);
    return; // Dejar que el navegador maneje la request
  }

  // NO cachear URLs excluidas
  const shouldExclude = EXCLUDE_FROM_CACHE.some(pattern => 
    url.pathname.includes(pattern) || url.hostname.includes(pattern)
  );

  if (shouldExclude) {
    console.log(`🚫 Service Worker: Skipping excluded URL: ${url.pathname}`);
    return; // Dejar que el navegador maneje la request
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

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log(`💾 Service Worker: Cache hit for ${request.url}`);
      return cachedResponse;
    }

    console.log(`🌐 Service Worker: Cache miss, fetching ${request.url}`);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Cache first failed', error);
    return new Response('Network error', { status: 503 });
  }
}

// Estrategia Network First (solo para GET requests)
async function networkFirst(request) {
  try {
    console.log(`🌐 Service Worker: Network first for ${request.url}`);
    const networkResponse = await fetch(request);

    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log(`💾 Service Worker: Network failed, trying cache for ${request.url}`);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Network and cache failed', { status: 503 });
  }
}
// Estrategia Cache First con fallback
async function cacheFirstWithFallback(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback para páginas
    if (request.destination === 'document') {
      const fallbackResponse = await caches.match('/index.html');
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    return new Response('Service unavailable', { status: 503 });
  }
}
// Helper: verificar si es un asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) || 
         url.pathname === '/' || 
         url.pathname.endsWith('.html');
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

// Error handling
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});

console.log('🎮 JuegoTEA Service Worker loaded successfully');