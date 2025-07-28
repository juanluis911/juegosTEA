const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP por ventana
});
app.use(limiter);

// CORS - permitir requests desde tu frontend
app.use(cors({
  origin: [
    'https://juegostea.onrender.com',
    'https://juegotea.com',
    'http://localhost:3000' // para desarrollo
  ],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/subscription', require('./src/routes/subscription'));
app.use('/api/user', require('./src/routes/user'));
app.use('/api/games', require('./src/routes/games'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'JuegoTEA API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

const admin = require('firebase-admin');

// Inicializar Firebase (solo una vez)
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase inicializado correctamente');
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error.message);
}

// Endpoint de prueba
app.get('/test-firebase', async (req, res) => {
  try {
    // Probar conexión a Firestore
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection').set({
      message: 'Firebase funciona!',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Firebase configurado correctamente',
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.split('@')[0] + '@...' // Ocultar dominio por seguridad
    });

  } catch (error) {
    console.error('Error en Firebase:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Agregar a tu server.js para probar MercadoPago
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configurar MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// Endpoint de prueba para crear preferencia
app.post('/test-mercadopago', async (req, res) => {
  try {
    const preference = new Preference(mercadopago);
    
    const preferenceData = {
      items: [{
        id: 'juegotea-premium',
        title: 'JuegoTEA Premium - Prueba',
        description: 'Suscripción mensual a JuegoTEA Premium',
        unit_price: 9.99,
        quantity: 1,
        currency_id: 'USD'
      }],
      payer: {
        email: 'test@example.com',
        name: 'Usuario de Prueba'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/subscription/success`,
        failure: `${process.env.FRONTEND_URL}/subscription/failure`,
        pending: `${process.env.FRONTEND_URL}/subscription/pending`
      },
      notification_url: `${process.env.API_URL}/api/subscription/webhook`,
      external_reference: 'test-user-123',
      auto_return: 'approved'
    };

    const response = await preference.create({ body: preferenceData });

    res.json({
      success: true,
      message: 'Preferencia creada correctamente',
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox'
    });

  } catch (error) {
    console.error('Error con MercadoPago:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Endpoint simple para verificar configuración
app.get('/test-mercadopago-config', (req, res) => {
  res.json({
    success: true,
    message: 'MercadoPago configurado',
    environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
    hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
    accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10) + '...'
  });
});
// Endpoint webhook básico para recibir notificaciones de MercadoPago
app.post('/api/subscription/webhook', async (req, res) => {
  try {
    console.log('📦 Webhook recibido de MercadoPago:', req.body);
    
    const { type, data, action } = req.body;
    
    // Responder rápidamente a MercadoPago (importante)
    res.status(200).json({ received: true });
    
    // Procesar la notificación de forma asíncrona
    if (type === 'payment') {
      console.log('💳 Notificación de pago recibida:', data.id);
      
      // Aquí implementarás la lógica para:
      // 1. Obtener detalles del pago con data.id
      // 2. Verificar el estado del pago
      // 3. Activar/desactivar suscripción del usuario
      // 4. Enviar email de confirmación
      
      // Por ahora solo logeamos
      console.log(`📧 Procesando pago ID: ${data.id}`);
    }
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Endpoint para probar webhooks manualmente
app.post('/test-webhook', (req, res) => {
  console.log('🧪 Test webhook llamado:', req.body);
  res.json({ 
    success: true, 
    message: 'Webhook de prueba recibido',
    timestamp: new Date().toISOString()
  });
});