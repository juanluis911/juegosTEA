// ⚡ JuegoTEA API Server - Configuración completa y corregida
// 🧩 Plataforma educativa para niños con TEA

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// === CONFIGURACIÓN INICIAL ===
const app = express();
const PORT = process.env.PORT || 3000;

console.log('\n🚀 Iniciando JuegoTEA API Server...');
console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Puerto: ${PORT}`);

// === VALIDACIÓN Y CONFIGURACIÓN DE MERCADOPAGO ===
function validateMercadoPagoConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  console.log('🔍 Verificando configuración de MercadoPago...');
  console.log('💡 Token presente:', !!accessToken);
  console.log('💡 Tipo de token:', accessToken ? (accessToken.startsWith('TEST') ? 'SANDBOX' : 'PRODUCTION') : 'NINGUNO');
  
  if (!accessToken) {
    console.error('❌ MERCADOPAGO_ACCESS_TOKEN no está configurado');
    return {
      valid: false,
      error: 'Token de acceso de MercadoPago no configurado',
      suggestion: 'Configura MERCADOPAGO_ACCESS_TOKEN en las variables de entorno'
    };
  }
  
  if (accessToken.length < 20) {
    console.error('❌ Token de MercadoPago parece inválido (muy corto)');
    return {
      valid: false,
      error: 'Token de MercadoPago inválido',
      suggestion: 'Verifica que el token sea correcto y completo'
    };
  }
  
  console.log('✅ Configuración de MercadoPago válida');
  return { valid: true };
}

// === INICIALIZACIÓN DE MERCADOPAGO ===
let mercadopagoClient = null;
let mercadopagoConfig = null;

try {
  const mpValidation = validateMercadoPagoConfig();
  
  if (mpValidation.valid) {
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    
    mercadopagoClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });
    
    mercadopagoConfig = { valid: true };
    console.log('🎉 MercadoPago inicializado correctamente');
  } else {
    mercadopagoConfig = mpValidation;
    console.warn('⚠️ MercadoPago NO inicializado:', mpValidation.error);
  }
} catch (error) {
  console.error('❌ Error inicializando MercadoPago:', error.message);
  mercadopagoConfig = { 
    valid: false, 
    error: 'Error de inicialización', 
    details: error.message 
  };
}

// === MIDDLEWARE DE SEGURIDAD ===
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// === COMPRESIÓN ===
app.use(compression());

// === CORS CONFIGURADO ===
const allowedOrigins = [
  'https://juegostea.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`🚫 CORS bloqueado para origin: ${origin}`);
      return callback(new Error('No permitido por CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-ID']
}));

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Demasiados requests desde esta IP',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// === PARSING DE BODY ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === MIDDLEWARE DE REQUEST ID ===
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.requestId);
  
  const timestamp = new Date().toISOString();
  console.log(`📥 [${req.requestId}] ${req.method} ${req.originalUrl} - ${req.ip} - ${timestamp}`);
  
  next();
});

// === ENDPOINT DE INFORMACIÓN GENERAL ===
app.get('/', (req, res) => {
  res.json({
    name: 'JuegoTEA API',
    version: '1.0.0',
    description: 'API backend para plataforma educativa de juegos para niños con TEA',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      subscription_create: '/api/subscription/create',
      subscription_status: '/api/subscription/status',
      subscription_webhook: '/api/subscription/webhook'
    },
    environment: process.env.NODE_ENV || 'development',
    mercadopago_status: mercadopagoConfig?.valid ? 'configured' : 'not_configured',
    cors_origins: allowedOrigins,
    requestId: req.requestId
  });
});

// === ENDPOINT DE SALUD ===
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    environment: process.env.NODE_ENV || 'development',
    services: {
      mercadopago: mercadopagoConfig?.valid ? 'operational' : 'error',
      api: 'operational'
    },
    requestId: req.requestId
  };

  if (!mercadopagoConfig?.valid) {
    healthStatus.warnings = [{
      service: 'mercadopago',
      message: mercadopagoConfig?.error || 'MercadoPago no configurado',
      suggestion: mercadopagoConfig?.suggestion
    }];
  }

  res.json(healthStatus);
});

// === ENDPOINT CREAR SUSCRIPCIÓN ===
app.post('/api/subscription/create', async (req, res) => {
  try {
    console.log(`🚀 [${req.requestId}] Iniciando creación de suscripción...`);
    console.log(`📋 [${req.requestId}] Body recibido:`, JSON.stringify(req.body, null, 2));

    // ❌ VERIFICAR CONFIGURACIÓN DE MERCADOPAGO PRIMERO
    if (!mercadopagoClient || !mercadopagoConfig?.valid) {
      console.error(`❌ [${req.requestId}] MercadoPago no está configurado`);
      return res.status(503).json({
        success: false,
        error: 'Servicio de pagos no disponible',
        details: 'MercadoPago no está configurado correctamente',
        requestId: req.requestId,
        troubleshooting: {
          step1: 'Verificar que MERCADOPAGO_ACCESS_TOKEN esté configurado',
          step2: 'El token debe empezar con TEST- para sandbox o APP_USR- para producción',
          step3: 'Reiniciar el servidor después de configurar las variables'
        }
      });
    }

    const { userEmail, userName, plan = 'premium' } = req.body;

    // Validaciones de entrada
    if (!userEmail || !userName) {
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        details: 'userEmail y userName son obligatorios',
        requestId: req.requestId
      });
    }

    // Definir planes disponibles
    const plans = {
      premium: {
        id: 'premium-monthly',
        title: 'JuegoTEA Premium',
        description: 'Acceso completo a todos los juegos educativos para TEA',
        unit_price: 9.99,
        currency_id: 'USD'
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        error: 'Plan no válido',
        details: `El plan "${plan}" no existe. Planes disponibles: ${Object.keys(plans).join(', ')}`,
        requestId: req.requestId
      });
    }

    console.log(`💰 [${req.requestId}] Plan seleccionado:`, selectedPlan);

    // Generar referencia externa única
    const externalReference = `juegotea_${plan}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crear fecha de expiración (1 hora)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    // ✅ CONFIGURACIÓN DE PREFERENCIA MEJORADA
    const preferenceData = {
      items: [{
        id: selectedPlan.id,
        title: selectedPlan.title,
        description: selectedPlan.description,
        unit_price: selectedPlan.unit_price,
        quantity: 1,
        currency_id: selectedPlan.currency_id
      }],
      payer: {
        name: userName,
        email: userEmail
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'https://juegostea.onrender.com'}/subscription/success`,
        failure: `${process.env.FRONTEND_URL || 'https://juegostea.onrender.com'}/subscription/failure`, 
        pending: `${process.env.FRONTEND_URL || 'https://juegostea.onrender.com'}/subscription/pending`
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${process.env.API_URL || 'https://api-juegostea.onrender.com'}/api/subscription/webhook`,
      expires: true,
      expiration_date_to: expirationDate.toISOString(),
      metadata: {
        user_email: userEmail,
        user_name: userName,
        plan: plan,
        created_at: new Date().toISOString(),
        source: 'juegotea_web'
      }
    };

    console.log(`📝 [${req.requestId}] Datos de preferencia:`, JSON.stringify(preferenceData, null, 2));

    // ✅ CREAR PREFERENCIA CON MANEJO DE ERRORES MEJORADO
    try {
      const { Preference } = require('mercadopago');
      const preference = new Preference(mercadopagoClient);
      
      console.log(`⏳ [${req.requestId}] Enviando solicitud a MercadoPago...`);
      
      const result = await preference.create({
        body: preferenceData
      });

      console.log(`✅ [${req.requestId}] Preferencia creada exitosamente:`, {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
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

    } catch (mpError) {
      console.error(`❌ [${req.requestId}] Error de MercadoPago:`, {
        message: mpError.message,
        status: mpError.status,
        cause: mpError.cause
      });

      return res.status(502).json({
        success: false,
        error: 'Error del proveedor de pagos',
        details: 'MercadoPago devolvió un error',
        mp_error: process.env.NODE_ENV === 'development' ? mpError.message : 'Error de conexión con el proveedor',
        requestId: req.requestId,
        troubleshooting: {
          message: 'Si el error persiste, verifica tus credenciales de MercadoPago',
          check_token: 'El token debe ser válido y tener permisos de creación de preferencias'
        }
      });
    }

  } catch (error) {
    console.error(`❌ [${req.requestId}] Error crítico:`, {
      message: error.message,
      stack: error.stack
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

// === WEBHOOK DE MERCADOPAGO ===
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
      // 4. Enviar notificación al usuario si es necesario
      
      console.log(`✅ [${req.requestId}] Webhook procesado correctamente`);
    }
    
    res.status(200).json({ 
      received: true,
      topic: topic,
      id: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ [${req.requestId}] Error en webhook:`, error);
    res.status(500).json({ 
      error: 'Error procesando webhook',
      requestId: req.requestId
    });
  }
});

// === ENDPOINT DE ESTADO DE SUSCRIPCIÓN ===
app.get('/api/subscription/status', (req, res) => {
  // TODO: Implementar verificación de estado de suscripción
  res.json({
    success: true,
    message: 'Endpoint de estado de suscripción - Por implementar',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// === ENDPOINT DE TEST (SOLO DESARROLLO) ===
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test', (req, res) => {
    res.json({
      message: 'Endpoint de testing - Solo disponible en desarrollo',
      environment: process.env.NODE_ENV,
      mercadopago_configured: !!mercadopagoClient,
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
  console.log(`💳 MercadoPago: ${mercadopagoConfig?.valid ? '✅ Configurado' : '❌ No configurado'}`);
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