const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const { MercadoPagoConfig, Preference } = require('mercadopago');

// === CONFIGURACIÓN MERCADOPAGO ===
let mercadopago = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
  console.log('💳 MercadoPago configurado en modo:', process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox');
}

// === MIDDLEWARE ===
app.use(helmet());

// CORS - URLs corregidas
app.use(cors({
  origin: [
    'https://juegostea.onrender.com',      // Tu frontend
    'https://api-juegostea.onrender.com',  // Tu API (auto-referencia)
    'https://juegotea.com',                // Dominio personalizado si lo tienes
    'http://localhost:3000',               // Desarrollo local
    'http://localhost:8080',               // Desarrollo local alternativo
    'http://127.0.0.1:3000',              // IP local
    'http://127.0.0.1:5500'               // Live Server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === LOGGING MIDDLEWARE ===
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// === RUTAS BÁSICAS ===
app.get('/', (req, res) => {
  res.json({ 
    message: 'JuegoTEA API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/health',
      subscription: {
        create: 'POST /api/subscription/create',
        status: 'GET /api/subscription/status',
        webhook: 'POST /api/subscription/webhook'
      }
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'JuegoTEA API',
    environment: process.env.NODE_ENV || 'development',
    mercadopago: mercadopago ? 'Configurado' : 'No configurado'
  });
});

// === RUTAS DE SUSCRIPCIÓN ===

// ✅ CREAR SUSCRIPCIÓN - Cambiar a POST para coincidir con el frontend
app.post('/api/subscription/create', async (req, res) => {
  try {
    console.log('📥 Request recibido en /api/subscription/create');
    console.log('📋 Body:', req.body);
    console.log('📋 Headers:', req.headers);

    if (!mercadopago) {
      return res.status(500).json({
        success: false,
        error: 'MercadoPago no está configurado'
      });
    }

    const { plan = 'premium', userEmail, userName } = req.body;

    // Validaciones
    if (!userEmail || !userName) {
      return res.status(400).json({
        success: false,
        error: 'Email y nombre son requeridos'
      });
    }

    // Definir planes disponibles
    const plans = {
      premium: {
        title: 'JuegoTEA Premium',
        price: 4.99,
        currency: 'USD',
        description: 'Acceso completo a todos los juegos y funcionalidades premium'
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        error: 'Plan no válido'
      });
    }

    console.log('💳 Creando preferencia de pago para:', { plan, userEmail, userName });

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
        name: userName
      },
      back_urls: {
        success: `https://juegostea.onrender.com/subscription/success`,
        failure: `https://juegostea.onrender.com/subscription/failure`,
        pending: `https://juegostea.onrender.com/subscription/pending`
      },
      notification_url: `https://api-juegostea.onrender.com/api/subscription/webhook`,
      external_reference: `user-${Date.now()}`,
      metadata: {
        plan: plan,
        created_at: new Date().toISOString(),
        environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox'
      },
      auto_return: 'approved'
    };

    const response = await preference.create({ body: preferenceData });

    console.log('✅ Preferencia creada:', response.id);

    res.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
      message: 'Preferencia de pago creada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error creando suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// WEBHOOK de MercadoPago
app.post('/api/subscription/webhook', async (req, res) => {
  try {
    console.log('🔔 Webhook recibido:', req.body);
    
    // Procesar notificación de MercadoPago
    const { type, data } = req.body;
    
    if (type === 'payment') {
      console.log('💰 Notificación de pago recibida:', data.id);
      // Aquí procesarías el pago
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

// Estado de suscripción
app.get('/api/subscription/status', (req, res) => {
  res.json({
    success: true,
    status: 'free', // Cambiar por lógica real
    message: 'Estado de suscripción obtenido'
  });
});

// === MANEJO DE ERRORES ===
app.use((err, req, res, next) => {
  console.error('💥 Error no manejado:', err);
  res.status(500).json({ 
    error: err.message || 'Error interno',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.warn(`🔍 Ruta no encontrada [${Math.random().toString(36).substr(2, 9)}]`, {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/subscription/create',
      'GET /api/subscription/status',
      'POST /api/subscription/webhook'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 API URL: https://api-juegostea.onrender.com`);
  console.log(`🎯 Endpoints disponibles:`);
  console.log(`   GET  /`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/subscription/create`);
  console.log(`   GET  /api/subscription/status`);
  console.log(`   POST /api/subscription/webhook`);
});