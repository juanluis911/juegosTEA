// 🚀 JuegoTEA Backend API - Versión con Debugging Avanzado
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// === CONFIGURACIÓN DE LOGGING ===
const winston = require('winston');

// Configurar logger personalizado
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const logMeta = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      const stackTrace = stack ? `\n${stack}` : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${stackTrace}${logMeta ? `\nMeta: ${logMeta}` : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: './logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: './logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// === CONFIGURACIÓN INICIAL ===
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

logger.info('🚀 Iniciando servidor JuegoTEA...', {
  environment: NODE_ENV,
  port: PORT,
  timestamp: new Date().toISOString()
});

// === MIDDLEWARE DE LOGGING PERSONALIZADO ===
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  req.requestId = requestId;
  req.startTime = startTime;
  
  logger.info(`📥 INCOMING REQUEST [${requestId}]`, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    headers: req.headers,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  
  // Interceptar la respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info(`📤 OUTGOING RESPONSE [${requestId}]`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: Buffer.byteLength(data || ''),
      response: NODE_ENV === 'development' ? data : undefined
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas peticiones desde esta IP, intenta en 15 minutos.',
    rateLimitInfo: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`🚫 Rate limit excedido [${req.requestId}]`, {
      ip: req.ip,
      method: req.method,
      url: req.url
    });
    res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones',
      retryAfter: Math.ceil(15 * 60) // 15 minutos en segundos
    });
  }
});

// === CONFIGURACIÓN DE MIDDLEWARE ===

// Seguridad
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
app.use('/api/', limiter);

// CORS con configuración detallada
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://juegostea.onrender.com',
      'https://juegotea.com',
      'http://localhost:3000',
      'http://localhost:5500',
      'http://localhost:8080',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:3000'
    ];
    
    // Permitir requests sin origin (apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      logger.info(`✅ CORS permitido para origin: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`❌ CORS bloqueado para origin: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} no permitido por política CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false
};

app.use(cors(corsOptions));

// Body parsing con límites
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Logging de requests
app.use(requestLogger);

// === CONFIGURACIÓN DE SERVICIOS ===

// Inicializar Firebase
let firebaseInitialized = false;
let firebase, db, auth;

try {
  logger.info('🔥 Inicializando Firebase...');
  const firebaseConfig = require('./src/config/firebase');
  firebase = firebaseConfig.firebase;
  db = firebaseConfig.db;
  auth = firebaseConfig.auth;
  firebaseInitialized = true;
  logger.info('✅ Firebase inicializado correctamente');
} catch (error) {
  logger.error('❌ Error inicializando Firebase', {
    error: error.message,
    stack: error.stack,
    configFile: './src/config/firebase'
  });
}

// Configurar MercadoPago
let mercadopago = null;
let mercadoPagoInitialized = false;

try {
  if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    logger.info('💳 Inicializando MercadoPago...');
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    
    mercadopago = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
    
    mercadoPagoInitialized = true;
    logger.info('✅ MercadoPago configurado', {
      environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
      accessTokenLength: process.env.MERCADOPAGO_ACCESS_TOKEN.length
    });
  } else {
    logger.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN no configurado');
  }
} catch (error) {
  logger.error('❌ Error configurando MercadoPago', {
    error: error.message,
    stack: error.stack
  });
}

// === RUTAS BÁSICAS ===

// Health check mejorado
app.get('/', (req, res) => {
  const healthData = {
    service: 'JuegoTEA API',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      firebase: firebaseInitialized,
      mercadoPago: mercadoPagoInitialized
    },
    requestId: req.requestId
  };
  
  logger.info(`🏠 Health check solicitado [${req.requestId}]`, healthData);
  res.json(healthData);
});

app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'JuegoTEA API',
    environment: NODE_ENV,
    services: {
      database: firebaseInitialized ? 'connected' : 'disconnected',
      payment: mercadoPagoInitialized ? 'configured' : 'not configured'
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform
    }
  };
  
  res.json(healthStatus);
});

// === ENDPOINTS DE DEBUGGING ===

// Variables de entorno (sin mostrar valores sensibles)
app.get('/debug/env', (req, res) => {
  logger.info(`🔍 Debug env solicitado [${req.requestId}]`);
  
  const envInfo = {
    success: true,
    requestId: req.requestId,
    environment: {
      NODE_ENV: NODE_ENV,
      PORT: PORT,
      
      // Firebase
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT_SET',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `SET (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : 'NOT_SET',
      
      // MercadoPago
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? `SET (${process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 8)}...)` : 'NOT_SET',
      MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY ? `SET (${process.env.MERCADOPAGO_PUBLIC_KEY.substring(0, 8)}...)` : 'NOT_SET',
      MERCADOPAGO_ENVIRONMENT: process.env.MERCADOPAGO_ENVIRONMENT || 'NOT_SET',
      
      // URLs
      API_URL: process.env.API_URL || 'NOT_SET',
      FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET'
    },
    services: {
      firebase: firebaseInitialized,
      mercadoPago: mercadoPagoInitialized
    },
    timestamp: new Date().toISOString()
  };
  
  res.json(envInfo);
});

// Test Firebase connection
app.get('/debug/firebase', async (req, res) => {
  logger.info(`🔥 Test Firebase solicitado [${req.requestId}]`);
  
  if (!firebaseInitialized) {
    const error = 'Firebase no está inicializado';
    logger.error(error, { requestId: req.requestId });
    return res.status(500).json({
      success: false,
      error,
      requestId: req.requestId
    });
  }

  try {
    // Probar conexión a Firestore
    const testDoc = await db.collection('test').doc('connection').set({
      message: 'Firebase funciona correctamente',
      timestamp: new Date(),
      server: 'JuegoTEA API',
      requestId: req.requestId
    });

    logger.info(`✅ Firebase test exitoso [${req.requestId}]`);
    
    res.json({
      success: true,
      message: 'Firebase configurado y funcionando correctamente',
      projectId: process.env.FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });

  } catch (error) {
    logger.error(`❌ Error en Firebase test [${req.requestId}]`, {
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      requestId: req.requestId
    });
  }
});

// Test MercadoPago configuration
app.get('/debug/mercadopago', async (req, res) => {
  logger.info(`💳 Test MercadoPago solicitado [${req.requestId}]`);
  
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      const error = 'MERCADOPAGO_ACCESS_TOKEN no configurado';
      logger.warn(error, { requestId: req.requestId });
      return res.status(400).json({
        success: false,
        error,
        requestId: req.requestId
      });
    }

    const configInfo = {
      success: true,
      message: 'MercadoPago configurado correctamente',
      environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
      accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10) + '...',
      publicKeyPrefix: process.env.MERCADOPAGO_PUBLIC_KEY?.substring(0, 10) + '...',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    };

    logger.info(`✅ MercadoPago test exitoso [${req.requestId}]`, configInfo);
    res.json(configInfo);

  } catch (error) {
    logger.error(`❌ Error en MercadoPago test [${req.requestId}]`, {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.requestId
    });
  }
});

// === RUTAS DE API ===

// Importar rutas de API (cuando estén disponibles)
try {
  const subscriptionRoutes = require('./src/routes/subscription');
  app.use('/api/subscription', subscriptionRoutes);
  logger.info('✅ Rutas de suscripción cargadas');
} catch (error) {
  logger.warn('⚠️ No se pudieron cargar las rutas de suscripción', {
    error: error.message
  });
}

try {
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  logger.info('✅ Rutas de autenticación cargadas');
} catch (error) {
  logger.warn('⚠️ No se pudieron cargar las rutas de autenticación', {
    error: error.message
  });
}

// === MANEJO DE ERRORES ===

// 404 Handler
app.use('*', (req, res) => {
  logger.warn(`🔍 Ruta no encontrada [${req.requestId}]`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    requestId: req.requestId,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /debug/env',
      'GET /debug/firebase',
      'GET /debug/mercadopago',
      'POST /api/subscription/create',
      'GET /api/subscription/status'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const errorId = Math.random().toString(36).substr(2, 9);
  
  logger.error(`💥 Error global [${req.requestId}] [${errorId}]`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  // No revelar información sensible en producción
  const errorResponse = {
    success: false,
    error: 'Error interno del servidor',
    errorId,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  };
  
  if (NODE_ENV === 'development') {
    errorResponse.details = {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    };
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// === MANEJO DE PROCESOS ===

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`🛑 Recibido ${signal}, cerrando servidor graciosamente...`);
  
  server.close(() => {
    logger.info('✅ Servidor HTTP cerrado');
    
    // Cerrar conexiones de base de datos si existen
    if (firebaseInitialized) {
      // Firebase se cierra automáticamente
      logger.info('🔥 Firebase desconectado');
    }
    
    logger.info('👋 Proceso terminado correctamente');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error('⚠️ Forzando cierre del proceso...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('💥 Excepción no capturada', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Promesa rechazada no manejada', {
    reason,
    promise
  });
  process.exit(1);
});

// === INICIAR SERVIDOR ===
const server = app.listen(PORT, () => {
  logger.info('🎉 ======================================');
  logger.info('🎮   JUEGOTEA API SERVIDOR INICIADO');
  logger.info('🎉 ======================================');
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`🌍 Entorno: ${NODE_ENV}`);
  logger.info(`📊 URL local: http://localhost:${PORT}`);
  logger.info(`🔥 Firebase: ${firebaseInitialized ? 'Conectado' : 'Desconectado'}`);
  logger.info(`💳 MercadoPago: ${mercadoPagoInitialized ? 'Configurado' : 'No configurado'}`);
  logger.info(`📝 Logs guardados en: ./logs/`);
  logger.info('🎉 ======================================');
});

module.exports = app;