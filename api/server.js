const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIGURACIÓN DE MIDDLEWARES DE SEGURIDAD ===
app.use(helmet({
  contentSecurityPolicy: false, // Para permitir calls a MercadoPago
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// === RATE LIMITING ===
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de requests por IP
  message: {
    error: 'Demasiadas requests desde esta IP, intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite específico para suscripciones
  message: {
    error: 'Demasiados intentos de suscripción, intenta nuevamente en 15 minutos.'
  }
});

app.use(generalLimiter);
app.use('/api/subscription', subscriptionLimiter);

// === CONFIGURACIÓN DE CORS ===
app.use(cors({
  origin: [
    'https://juegostea.onrender.com',
    'https://juegosTEA.onrender.com', // Por si hay diferencias en mayúsculas
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    process.env.FRONTEND_URL
  ].filter(Boolean), // Filtrar valores undefined
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// === MIDDLEWARES DE PARSING ===
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === MIDDLEWARE DE LOGGING MEJORADO ===
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🌐 [${requestId}] ${timestamp}`);
  console.log(`📍 ${req.method} ${req.originalUrl}`);
  console.log(`🔍 IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`🌍 Origin: ${req.get('Origin') || 'No origin'}`);
  console.log(`📱 User-Agent: ${req.get('User-Agent')?.substring(0, 80)}...`);
  
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    // Ocultar datos sensibles en logs
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.userEmail) {
      sanitizedBody.userEmail = sanitizedBody.userEmail.substring(0, 3) + '***@***';
    }
    console.log(`📦 Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  console.log(`${'='.repeat(80)}`);
  
  req.requestId = requestId;
  req.startTime = Date.now();
  
  // Log de respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    console.log(`📤 [${requestId}] Response: ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, data);
  };
  
  next();
});

// === CONFIGURACIÓN DE MERCADOPAGO ===
let mercadopago = null;
let Preference = null;

try {
  console.log('🔧 Configurando MercadoPago...');
  
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN no encontrado en variables de entorno');
    console.warn('⚠️ Los pagos estarán deshabilitados');
  } else {
    const { MercadoPagoConfig, Preference: PreferenceClass } = require('mercadopago');
    
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });
    
    mercadopago = client;
    Preference = PreferenceClass;
    console.log('✅ MercadoPago configurado correctamente');
  }
} catch (error) {
  console.error('❌ Error configurando MercadoPago:', error.message);
  console.error('❌ Instala el SDK: npm install mercadopago');
}

// === RUTAS DE SALUD Y STATUS ===
app.get('/', (req, res) => {
  console.log(`✅ [${req.requestId}] Root endpoint accessed`);
  
  res.json({
    success: true,
    message: '🧩 JuegoTEA API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    endpoints: {
      health: 'GET /health',
      subscription: {
        create: 'POST /api/subscription/create',
        status: 'GET /api/subscription/status',
        webhook: 'POST /api/subscription/webhook'
      }
    },
    documentation: 'https://github.com/tu-usuario/juegotea/blob/main/api/README.md'
  });
});

app.get('/health', (req, res) => {
  console.log(`💚 [${req.requestId}] Health check realizado`);
  
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    environment: process.env.NODE_ENV || 'development',
    mercadopago: mercadopago ? 'Configurado' : 'No configurado',
    version: '1.0.0',
    platform: process.platform,
    nodeVersion: process.version
  };
  
  res.json(healthStatus);
});

// === RUTAS DE SUSCRIPCIÓN ===

// ✅ CREAR SUSCRIPCIÓN
app.post('/api/subscription/create', async (req, res) => {
  try {
    console.log(`📥 [${req.requestId}] Iniciando creación de suscripción`);
    
    // Verificar configuración de MercadoPago
    if (!mercadopago || !Preference) {
      console.error(`❌ [${req.requestId}] MercadoPago no está configurado`);
      return res.status(500).json({
        success: false,
        error: 'Servicio de pagos no disponible',
        details: 'MercadoPago no está configurado correctamente',
        requestId: req.requestId
      });
    }

    const { plan = 'premium', userEmail, userName } = req.body;

    // Validaciones exhaustivas
    if (!userEmail || !userName) {
      console.warn(`⚠️ [${req.requestId}] Datos faltantes:`, { 
        userEmail: !!userEmail, 
        userName: !!userName 
      });
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        details: 'Email y nombre son obligatorios',
        received: { 
          userEmail: !!userEmail, 
          userName: !!userName 
        },
        requestId: req.requestId
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.warn(`⚠️ [${req.requestId}] Email inválido:`, userEmail.substring(0, 5) + '***');
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido',
        requestId: req.requestId
      });
    }

    // Validar longitud del nombre
    if (userName.trim().length < 2) {
      console.warn(`⚠️ [${req.requestId}] Nombre muy corto`);
      return res.status(400).json({
        success: false,
        error: 'El nombre debe tener al menos 2 caracteres',
        requestId: req.requestId
      });
    }

    // Definir planes disponibles
    const plans = {
      premium: {
        title: 'JuegoTEA Premium',
        price: 4.99,
        currency: 'USD',
        description: 'Acceso completo a todos los juegos y funcionalidades premium de JuegoTEA'
      },
      basic: {
        title: 'JuegoTEA Básico',
        price: 2.99,
        currency: 'USD',
        description: 'Acceso a juegos básicos de JuegoTEA'
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      console.warn(`⚠️ [${req.requestId}] Plan inválido:`, plan);
      return res.status(400).json({
        success: false,
        error: 'Plan de suscripción no válido',
        availablePlans: Object.keys(plans),
        requestId: req.requestId
      });
    }

    console.log(`💳 [${req.requestId}] Creando preferencia de pago`, { 
      plan, 
      userEmail: userEmail.substring(0, 3) + '***', 
      userName: userName.substring(0, 3) + '***' 
    });

    // Crear referencia externa única
    const externalReference = `juegotea-${plan}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Configurar preferencia de MercadoPago
    const preference = new Preference(mercadopago);
    
    const preferenceData = {
      items: [{
        id: `juegotea-${plan}`,
        title: selectedPlan.title,
        description: selectedPlan.description,
        unit_price: selectedPlan.price,
        quantity: 1,
        currency_id: selectedPlan.currency
      }],
      payer: {
        email: userEmail,
        name: userName.trim()
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'https://juegostea.onrender.com'}/subscription/success.html`,
        failure: `${process.env.FRONTEND_URL || 'https://juegostea.onrender.com'}/subscription/failure.html`,
        pending: `${process.env.FRONTEND_URL || 'https://juegostea.onrender.com'}/subscription/pending.html`
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${req.protocol}://${req.get('host')}/api/subscription/webhook`,
      metadata: {
        plan: plan,
        user_email: userEmail,
        user_name: userName,
        created_at: new Date().toISOString(),
        request_id: req.requestId
      },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    console.log(`🏗️ [${req.requestId}] Enviando preferencia a MercadoPago...`);

    const result = await preference.create({ body: preferenceData });
    
    console.log(`✅ [${req.requestId}] Preferencia creada exitosamente`, {
      id: result.id,
      external_reference: externalReference,
      has_init_point: !!result.init_point,
      has_sandbox_init_point: !!result.sandbox_init_point
    });

    // Respuesta exitosa
    const responseData = {
      success: true,
      preference_id: result.id,
      external_reference: externalReference,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      environment: process.env.NODE_ENV || 'development',
      plan: selectedPlan,
      user: {
        email: userEmail,
        name: userName
      },
      expires_at: preferenceData.expiration_date_to,
      created_at: new Date().toISOString(),
      requestId: req.requestId
    };

    res.json(responseData);

  } catch (error) {
    console.error(`❌ [${req.requestId}] Error crítico en creación de suscripción:`, {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando la suscripción',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ WEBHOOK DE MERCADOPAGO
app.post('/api/subscription/webhook', async (req, res) => {
  try {
    console.log(`🔔 [${req.requestId}] Webhook recibido de MercadoPago`);
    console.log(`🔔 [${req.requestId}] Query params:`, req.query);
    console.log(`🔔 [${req.requestId}] Body:`, JSON.stringify(req.body, null, 2));
    
    const { topic, id } = req.query;
    
    if (!topic || !id) {
      console.warn(`⚠️ [${req.requestId}] Webhook sin topic o id válido`);
      return res.status(400).json({
        success: false,
        error: 'Webhook inválido: faltan parámetros topic o id'
      });
    }
    
    if (topic === 'payment') {
      console.log(`💳 [${req.requestId}] Procesando notificación de pago: ${id}`);
      
      // TODO: Implementar verificación del pago
      // 1. Usar el SDK de MercadoPago para obtener detalles del pago
      // 2. Verificar el estado del pago (approved, rejected, pending, etc.)
      // 3. Actualizar base de datos con el estado de la suscripción
      // 4. Enviar email de confirmación si es necesario
      
      console.log(`✅ [${req.requestId}] Webhook de pago procesado`);
      
    } else if (topic === 'merchant_order') {
      console.log(`📦 [${req.requestId}] Procesando orden de comerciante: ${id}`);
      
      // TODO: Implementar lógica de orden
      
      console.log(`✅ [${req.requestId}] Webhook de orden procesado`);
      
    } else {
      console.warn(`⚠️ [${req.requestId}] Tipo de webhook desconocido: ${topic}`);
    }
    
    // Siempre responder con 200 para confirmar recepción
    res.status(200).json({ 
      success: true, 
      message: 'Webhook procesado correctamente',
      topic: topic,
      id: id,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
    
  } catch (error) {
    console.error(`❌ [${req.requestId}] Error procesando webhook:`, {
      message: error.message,
      stack: error.stack
    });
    
    // Incluso con error, responder 200 para evitar reenvíos
    res.status(200).json({ 
      success: false,
      error: 'Error procesando webhook',
      message: 'Webhook recibido pero no procesado correctamente',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ ESTADO DE SUSCRIPCIÓN
app.get('/api/subscription/status', async (req, res) => {
  try {
    console.log(`🔍 [${req.requestId}] Consultando estado de suscripción`);
    
    // TODO: Implementar lógica real de verificación
    // Por ahora retornamos estado por defecto
    
    const statusData = {
      success: true,
      status: 'free', // 'free' | 'premium' | 'expired' | 'pending'
      plan: null,
      expires_at: null,
      features: {
        basic_games: true,
        premium_games: false,
        progress_tracking: false,
        unlimited_access: false
      },
      message: 'Estado de suscripción obtenido correctamente',
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };
    
    res.json(statusData);
    
  } catch (error) {
    console.error(`❌ [${req.requestId}] Error obteniendo estado:`, error);
    
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado de suscripción',
      requestId: req.requestId
    });
  }
});

// === RUTA DE TESTING (solo en desarrollo) ===
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test', (req, res) => {
    console.log(`🧪 [${req.requestId}] Endpoint de testing`);
    
    res.json({
      success: true,
      message: 'Endpoint de testing funcionando',
      environment: process.env.NODE_ENV,
      mercadopago_configured: !!mercadopago,
      timestamp: new Date().toISOString(),
      test_data: {
        sample_subscription: {
          plan: 'premium',
          userEmail: 'test@example.com',
          userName: 'Test User'
        }
      }
    });
  });
}

// === MANEJO GLOBAL DE ERRORES ===
app.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  console.error(`💥 [${requestId}] Error no controlado:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'production' ? 
      'Error interno del servidor' : 
      err.message,
    requestId: requestId,
    timestamp: new Date().toISOString()
  });
});

// === HANDLER 404 ===
app.use('*', (req, res) => {
  const requestId = req.requestId || Math.random().toString(36).substr(2, 9);
  
  console.warn(`🔍 [${requestId}] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({ 
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: requestId,
    availableEndpoints: [
      'GET / - Información de la API',
      'GET /health - Estado del servidor',
      'POST /api/subscription/create - Crear suscripción',
      'GET /api/subscription/status - Estado de suscripción',
      'POST /api/subscription/webhook - Webhook de MercadoPago'
    ],
    documentation: 'https://github.com/tu-usuario/juegotea/blob/main/api/README.md'
  });
});

// === MANEJO DE SEÑALES DE SISTEMA ===
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida (Ctrl+C), cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado correctamente');
    process.exit(0);
  });
});

// === MANEJO DE ERRORES DE PROCESO ===
process.on('uncaughtException', (error) => {
  console.error('💥 Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promise rechazada no manejada en:', promise);
  console.error('💥 Razón:', reason);
  process.exit(1);
});

// === INICIAR SERVIDOR ===
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(80));
  console.log('🧩 JUEGOTEA API - SERVIDOR INICIADO CORRECTAMENTE');
  console.log('='.repeat(80));
  console.log(`🚀 Puerto: ${PORT}`);
  console.log(`🌐 URL: https://api-juegostea.onrender.com`);
  console.log(`🛠️ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
  console.log(`💳 MercadoPago: ${mercadopago ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`🧠 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
  console.log(`📊 Node.js: ${process.version}`);
  console.log('='.repeat(80));
  console.log('📋 ENDPOINTS DISPONIBLES:');
  console.log('   GET  / - Información general de la API');
  console.log('   GET  /health - Estado de salud del servidor');
  console.log('   POST /api/subscription/create - Crear nueva suscripción');
  console.log('   GET  /api/subscription/status - Verificar estado de suscripción');
  console.log('   POST /api/subscription/webhook - Webhook de MercadoPago');
  if (process.env.NODE_ENV !== 'production') {
    console.log('   GET  /api/test - Endpoint de testing (solo desarrollo)');
  }
  console.log('='.repeat(80));
  console.log('🌍 CORS CONFIGURADO PARA:');
  console.log('   ✅ https://juegostea.onrender.com');
  console.log('   ✅ http://localhost:3000');
  console.log('   ✅ http://127.0.0.1:5500');
  console.log('='.repeat(80));
  
  // Advertencias importantes
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.log('⚠️  ADVERTENCIA CRÍTICA:');
    console.log('   🔐 MERCADOPAGO_ACCESS_TOKEN no configurado');
    console.log('   💳 Los pagos NO funcionarán hasta configurar esta variable');
    console.log('   📝 Configúrala en las variables de entorno de Render');
    console.log('='.repeat(80));
  }
  
  console.log('✅ Servidor listo para recibir peticiones');
  console.log('🎯 Monitoreo activo de requests iniciado');
  console.log('='.repeat(80) + '\n');
});

// === MANEJO DE ERRORES DEL SERVIDOR ===
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Puerto ${PORT} ya está en uso`);
    console.error('💡 Solución: Cambia el puerto o detén el proceso que lo está usando');
    process.exit(1);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Error: Sin permisos para usar el puerto ${PORT}`);
    console.error('💡 Solución: Usa un puerto mayor a 1024 o ejecuta con sudo');
    process.exit(1);
  } else {
    console.error('❌ Error crítico del servidor:', error);
    process.exit(1);
  }
});

// Exportar app para testing
module.exports = app;