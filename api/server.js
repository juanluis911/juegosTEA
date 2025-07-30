// ⚡ JuegoTEA API Server - Configuración mejorada con logging completo
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

// === FUNCIÓN DE LOGGING MEJORADA ===
function log(level, requestId, message, data = null) {
  const timestamp = new Date().toISOString();
  const logPrefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍',
    mercadopago: '💳',
    server: '🚀',
    webhook: '🔔',
    validation: '🛡️'
  };

  const prefix = logPrefix[level] || '📝';
  console.log(`${prefix} [${timestamp}] [${requestId || 'SYSTEM'}] ${message}`);
  
  if (data) {
    console.log(`   📊 Data:`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

// === INICIALIZACIÓN DEL SERVIDOR ===
log('server', 'INIT', 'Iniciando JuegoTEA API Server...');
log('info', 'INIT', `Entorno: ${process.env.NODE_ENV || 'development'}`);
log('info', 'INIT', `Puerto: ${PORT}`);

// === MIDDLEWARE DE REQUEST ID ===
app.use((req, res, next) => {
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  log('info', req.requestId, `${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100)
  });
  next();
});

// === MIDDLEWARE BÁSICO ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === VALIDACIÓN Y CONFIGURACIÓN DE MERCADOPAGO ===
function validateMercadoPagoConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  log('debug', 'CONFIG', 'Verificando configuración de MercadoPago...');
  log('debug', 'CONFIG', `Token presente: ${!!accessToken}`);
  
  if (!accessToken) {
    log('error', 'CONFIG', 'MERCADOPAGO_ACCESS_TOKEN no está configurado');
    return {
      valid: false,
      error: 'Token de acceso de MercadoPago no configurado',
      suggestion: 'Configura MERCADOPAGO_ACCESS_TOKEN en las variables de entorno'
    };
  }
  
  // Validar formato del token
  const tokenType = accessToken.startsWith('TEST-') ? 'SANDBOX' : 
                   accessToken.startsWith('APP_USR-') ? 'PRODUCTION' : 'UNKNOWN';
  
  log('debug', 'CONFIG', `Tipo de token: ${tokenType}`);
  
  if (accessToken.length < 20) {
    log('error', 'CONFIG', 'Token de MercadoPago parece inválido (muy corto)');
    return {
      valid: false,
      error: 'Token de MercadoPago inválido',
      suggestion: 'Verifica que el token sea correcto y completo'
    };
  }
  
  if (tokenType === 'UNKNOWN') {
    log('warning', 'CONFIG', 'Formato de token no reconocido, pero procederá');
  }
  
  log('success', 'CONFIG', 'Configuración de MercadoPago válida');
  return { valid: true, tokenType };
}

// === INICIALIZACIÓN DE MERCADOPAGO ===
let mercadopagoClient = null;
let mercadopagoConfig = null;

try {
  const mpValidation = validateMercadoPagoConfig();
  
  if (mpValidation.valid) {
    log('debug', 'MP-INIT', 'Importando SDK de MercadoPago...');
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    
    log('debug', 'MP-INIT', 'Creando cliente de MercadoPago...');
    mercadopagoClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });
    
    mercadopagoConfig = { valid: true, tokenType: mpValidation.tokenType };
    log('success', 'MP-INIT', 'MercadoPago inicializado correctamente', {
      tokenType: mpValidation.tokenType,
      timeout: 5000
    });
  } else {
    mercadopagoConfig = mpValidation;
    log('warning', 'MP-INIT', 'MercadoPago NO inicializado', mpValidation.error);
  }
} catch (error) {
  log('error', 'MP-INIT', 'Error inicializando MercadoPago', {
    message: error.message,
    stack: error.stack
  });
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
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      log('warning', 'CORS', `Origen no permitido: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas peticiones',
    details: 'Intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// === ENDPOINT RAÍZ ===
app.get('/', (req, res) => {
  log('info', req.requestId, 'Acceso a endpoint raíz');
  res.json({
    name: 'JuegoTEA API',
    version: '1.0.0',
    description: 'API para plataforma educativa de niños con TEA',
    status: 'operational',
    endpoints: {
      health: '/health',
      subscription_create: '/api/subscription/create',
      subscription_status: '/api/subscription/status',
      webhook: '/api/subscription/webhook'
    },
    mercadopago_status: mercadopagoConfig?.valid ? 'configured' : 'not_configured',
    cors_origins: allowedOrigins,
    requestId: req.requestId
  });
});

// === ENDPOINT DE SALUD ===
app.get('/health', (req, res) => {
  log('debug', req.requestId, 'Health check solicitado');
  
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

  log('success', req.requestId, 'Health check completado', healthStatus);
  res.json(healthStatus);
});

// === ENDPOINT CREAR SUSCRIPCIÓN ===
app.post('/api/subscription/create', async (req, res) => {
  try {
    log('mercadopago', req.requestId, 'Iniciando creación de suscripción...');
    log('debug', req.requestId, 'Body recibido', req.body);

    // ❌ VERIFICAR CONFIGURACIÓN DE MERCADOPAGO PRIMERO
    log('validation', req.requestId, 'Verificando configuración de MercadoPago...', {
      configValid: mercadopagoConfig?.valid,
      clientExists: !!mercadopagoClient,
      tokenType: mercadopagoConfig?.tokenType,
      environment: process.env.NODE_ENV || 'development'
    });

    if (!mercadopagoClient || !mercadopagoConfig?.valid) {
      log('error', req.requestId, 'MercadoPago no está configurado', mercadopagoConfig);
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
    log('validation', req.requestId, 'Validando datos de entrada...', {
      userEmail: !!userEmail,
      userName: !!userName,
      plan
    });

    if (!userEmail || !userName) {
      log('error', req.requestId, 'Datos requeridos faltantes');
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        details: 'userEmail y userName son obligatorios',
        requestId: req.requestId
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      log('error', req.requestId, 'Email inválido', userEmail);
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
        details: 'El formato del email no es válido',
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
      log('error', req.requestId, `Plan no válido: ${plan}`);
      return res.status(400).json({
        success: false,
        error: 'Plan no válido',
        details: `El plan "${plan}" no existe. Planes disponibles: ${Object.keys(plans).join(', ')}`,
        requestId: req.requestId
      });
    }

    log('success', req.requestId, 'Plan seleccionado', selectedPlan);

    // Generar referencia externa única
    const externalReference = `juegotea_${plan}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    log('debug', req.requestId, `Referencia externa generada: ${externalReference}`);

    // Crear fecha de expiración (1 hora)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    log('debug', req.requestId, `Fecha de expiración: ${expirationDate.toISOString()}`);

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

    log('debug', req.requestId, 'Datos de preferencia preparados', preferenceData);

    // ✅ CREAR PREFERENCIA CON MANEJO DE ERRORES MEJORADO
    try {
      log('mercadopago', req.requestId, 'Importando clase Preference...');
      const { Preference } = require('mercadopago');
      
      log('mercadopago', req.requestId, 'Creando instancia de Preference...');
      const preference = new Preference(mercadopagoClient);
      
      log('mercadopago', req.requestId, 'Enviando solicitud a MercadoPago...', {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20) + '...',
        environment: mercadopagoConfig.tokenType
      });
      
      const result = await preference.create({
        body: preferenceData
      });

      log('success', req.requestId, 'Preferencia creada exitosamente', {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        status: result.status
      });

      // Respuesta exitosa
      const responseData = {
        success: true,
        preference_id: result.id,
        external_reference: externalReference,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        environment: process.env.NODE_ENV || 'development',
        token_type: mercadopagoConfig.tokenType,
        plan: selectedPlan,
        user: {
          email: userEmail,
          name: userName
        },
        expires_at: preferenceData.expiration_date_to,
        created_at: new Date().toISOString(),
        requestId: req.requestId
      };

      log('success', req.requestId, 'Respuesta enviada al cliente', responseData);
      res.json(responseData);

    } catch (mpError) {
      log('error', req.requestId, 'Error de MercadoPago', {
        message: mpError.message,
        status: mpError.status,
        cause: mpError.cause,
        stack: mpError.stack
      });

      return res.status(502).json({
        success: false,
        error: 'Error del proveedor de pagos',
        details: 'MercadoPago devolvió un error',
        mp_error: process.env.NODE_ENV === 'development' ? mpError.message : 'Error de conexión con el proveedor',
        mp_status: mpError.status,
        requestId: req.requestId,
        troubleshooting: {
          message: 'Si el error persiste, verifica tus credenciales de MercadoPago',
          check_token: 'El token debe ser válido y tener permisos de creación de preferencias',
          check_environment: 'Verifica si estás usando el token correcto para el entorno'
        }
      });
    }

  } catch (error) {
    log('error', req.requestId, 'Error crítico en creación de suscripción', {
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
    log('webhook', req.requestId, 'Webhook recibido de MercadoPago', {
      query: req.query,
      headers: {
        'content-type': req.get('content-type'),
        'user-agent': req.get('user-agent'),
        'x-forwarded-for': req.get('x-forwarded-for')
      }
    });
    
    const { topic, id } = req.query;
    
    if (!topic || !id) {
      log('warning', req.requestId, 'Webhook sin topic o id válido', { topic, id });
      return res.status(400).json({
        success: false,
        error: 'Webhook inválido: faltan parámetros topic o id'
      });
    }
    
    log('webhook', req.requestId, `Procesando webhook - Topic: ${topic}, ID: ${id}`);
    
    if (topic === 'payment') {
      log('mercadopago', req.requestId, `Procesando notificación de pago: ${id}`);
      
      // TODO: Implementar verificación del pago
      try {
        // Aquí deberías obtener los detalles del pago usando el SDK
        log('debug', req.requestId, 'TODO: Obtener detalles del pago desde MercadoPago');
        log('debug', req.requestId, 'TODO: Verificar estado del pago');
        log('debug', req.requestId, 'TODO: Actualizar base de datos');
        log('debug', req.requestId, 'TODO: Enviar notificación al usuario');
        
      } catch (paymentError) {
        log('error', req.requestId, 'Error procesando pago', paymentError);
      }
    }
    
    const response = { 
      received: true,
      topic: topic,
      id: id,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };
    
    log('success', req.requestId, 'Webhook procesado correctamente', response);
    res.status(200).json(response);
    
  } catch (error) {
    log('error', req.requestId, 'Error en webhook', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Error procesando webhook',
      requestId: req.requestId
    });
  }
});

// === ENDPOINT DE ESTADO DE SUSCRIPCIÓN ===
app.get('/api/subscription/status', (req, res) => {
  log('info', req.requestId, 'Consultando estado de suscripción');
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
    log('debug', req.requestId, 'Acceso a endpoint de testing');
    res.json({
      message: 'Endpoint de testing - Solo disponible en desarrollo',
      environment: process.env.NODE_ENV,
      mercadopago_configured: !!mercadopagoClient,
      mercadopago_token_type: mercadopagoConfig?.tokenType || 'not_configured',
      timestamp: new Date().toISOString(),
      test_data: {
        sample_subscription: {
          plan: 'premium',
          userEmail: 'test@example.com',
          userName: 'Test User'
        }
      },
      requestId: req.requestId
    });
  });
}

// === MANEJO DE RUTAS NO ENCONTRADAS ===
app.use('*', (req, res) => {
  log('warning', req.requestId, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    available_endpoints: [
      'GET /',
      'GET /health',
      'POST /api/subscription/create',
      'GET /api/subscription/status',
      'POST /api/subscription/webhook'
    ],
    requestId: req.requestId
  });
});

// === MANEJO GLOBAL DE ERRORES ===
app.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  log('error', requestId, 'Error no controlado', {
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

// === INICIAR SERVIDOR ===
const server = app.listen(PORT, () => {
  log('server', 'STARTUP', '='.repeat(80));
  log('server', 'STARTUP', `🎯 JuegoTEA API Server iniciado exitosamente`);
  log('server', 'STARTUP', `🌐 Servidor escuchando en puerto ${PORT}`);
  log('server', 'STARTUP', `🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  log('server', 'STARTUP', `💳 MercadoPago: ${mercadopagoConfig?.valid ? '✅ Configurado' : '❌ No configurado'}`);
  log('server', 'STARTUP', `🧠 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
  log('server', 'STARTUP', `📊 Node.js: ${process.version}`);
  log('server', 'STARTUP', '='.repeat(80));
  log('server', 'STARTUP', '📋 ENDPOINTS DISPONIBLES:');
  log('server', 'STARTUP', '   GET  / - Información general de la API');
  log('server', 'STARTUP', '   GET  /health - Estado de salud del servidor');
  log('server', 'STARTUP', '   POST /api/subscription/create - Crear nueva suscripción');
  log('server', 'STARTUP', '   GET  /api/subscription/status - Verificar estado de suscripción');
  log('server', 'STARTUP', '   POST /api/subscription/webhook - Webhook de MercadoPago');
  if (process.env.NODE_ENV !== 'production') {
    log('server', 'STARTUP', '   GET  /api/test - Endpoint de testing (solo desarrollo)');
  }
  log('server', 'STARTUP', '='.repeat(80));
  log('server', 'STARTUP', '🌍 CORS CONFIGURADO PARA:');
  allowedOrigins.forEach(origin => {
    log('server', 'STARTUP', `   ✅ ${origin}`);
  });
  log('server', 'STARTUP', '='.repeat(80));
  
  // Advertencias importantes
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    log('warning', 'STARTUP', '⚠️  ADVERTENCIA CRÍTICA:');
    log('warning', 'STARTUP', '   🔐 MERCADOPAGO_ACCESS_TOKEN no configurado');
    log('warning', 'STARTUP', '   💳 Los pagos NO funcionarán hasta configurar esta variable');
    log('warning', 'STARTUP', '   📝 Configúrala en las variables de entorno de Render');
    log('server', 'STARTUP', '='.repeat(80));
  }
  
  log('success', 'STARTUP', '✅ Servidor listo para recibir peticiones');
  log('info', 'STARTUP', '🎯 Monitoreo activo de requests iniciado');
  log('server', 'STARTUP', '='.repeat(80) + '\n');
});

// === MANEJO DE ERRORES DEL SERVIDOR ===
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    log('error', 'SERVER', `Puerto ${PORT} ya está en uso`);
    log('error', 'SERVER', 'Solución: Cambia el puerto o detén el proceso que lo está usando');
    process.exit(1);
  } else if (error.code === 'EACCES') {
    log('error', 'SERVER', `Sin permisos para usar el puerto ${PORT}`);
    log('error', 'SERVER', 'Solución: Usa un puerto mayor a 1024 o ejecuta con sudo');
    process.exit(1);
  } else {
    log('error', 'SERVER', 'Error crítico del servidor', error);
    process.exit(1);
  }
});

// === MANEJO DE CIERRE GRACEFUL ===
process.on('SIGTERM', () => {
  log('warning', 'SHUTDOWN', 'Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    log('success', 'SHUTDOWN', 'Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('warning', 'SHUTDOWN', 'Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    log('success', 'SHUTDOWN', 'Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Exportar app para testing
module.exports = app;