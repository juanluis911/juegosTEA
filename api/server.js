const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configurar MercadoPago
let mercadopago = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
  console.log('💳 MercadoPago configurado en modo:', process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox');
}
// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: [
    'https://juegostea.onrender.com',
    'https://juegotea.com',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Inicializar Firebase
let firebaseInitialized = false;
let firebase, db, auth;

try {
  const firebaseConfig = require('./src/config/firebase');
  firebase = firebaseConfig.firebase;
  db = firebaseConfig.db;
  auth = firebaseConfig.auth;
  firebaseInitialized = true;
} catch (error) {
  console.error('❌ Error cargando Firebase:', error.message);
}

// === RUTAS BÁSICAS ===

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'JuegoTEA API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    firebase: firebaseInitialized ? 'Conectado' : 'Desconectado'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'JuegoTEA API',
    environment: process.env.NODE_ENV || 'development',
    firebase: firebaseInitialized
  });
});

// Endpoint para verificar variables de entorno
app.get('/debug-env', (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      PORT: process.env.PORT || 'not set',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'not set',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'not set',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : 'not set',
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'set' : 'not set',
      API_URL: process.env.API_URL || 'not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set'
    }
  });
});

// === ENDPOINTS FIREBASE ===

// Test Firebase connection
app.get('/test-firebase', async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(500).json({
      success: false,
      error: 'Firebase no está inicializado'
    });
  }

  try {
    // Probar conexión a Firestore
    const testDoc = await db.collection('test').doc('connection').set({
      message: 'Firebase funciona correctamente',
      timestamp: new Date(),
      server: 'JuegoTEA API'
    });

    res.json({
      success: true,
      message: 'Firebase configurado correctamente',
      projectId: process.env.FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en Firebase test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === ENDPOINTS MERCADOPAGO ===

// Test MercadoPago configuration
app.get('/test-mercadopago-config', (req, res) => {
  res.json({
    success: true,
    message: 'MercadoPago configurado',
    environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
    hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
    accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10) + '...',
    publicKeyPrefix: process.env.MERCADOPAGO_PUBLIC_KEY?.substring(0, 10) + '...'
  });
});

// Create MercadoPago preference (basic test)
app.post('/test-mercadopago', async (req, res) => {
  try {
    // Solo verificar que tenemos las credenciales
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(400).json({
        success: false,
        error: 'MERCADOPAGO_ACCESS_TOKEN no configurado'
      });
    }

    // Por ahora solo confirmamos que está configurado
    res.json({
      success: true,
      message: 'MercadoPago credenciales presentes',
      environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox',
      note: 'Implementación completa pendiente'
    });

  } catch (error) {
    console.error('Error con MercadoPago:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// === ERROR HANDLING ===

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Crear suscripción premium
app.post('/api/subscription/create', async (req, res) => {
  try {
    if (!mercadopago) {
      return res.status(500).json({
        success: false,
        error: 'MercadoPago no está configurado'
      });
    }

    const { plan = 'premium', userEmail, userName } = req.body;

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
        email: userEmail || 'test@example.com',
        name: userName || 'Usuario JuegoTEA'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/subscription/success`,
        failure: `${process.env.FRONTEND_URL}/subscription/failure`,
        pending: `${process.env.FRONTEND_URL}/subscription/pending`
      },
      notification_url: `${process.env.API_URL}/api/subscription/webhook`,
      external_reference: `user-${Date.now()}`, // Cambiar por user ID real cuando tengas auth
      metadata: {
        plan: plan,
        created_at: new Date().toISOString(),
        environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox'
      },
      auto_return: 'approved'
    };

    const response = await preference.create({ body: preferenceData });

    console.log('✅ Preferencia creada:', response.id);

    // Guardar referencia del pago pendiente (opcional, para tracking)
    if (firebaseInitialized) {
      try {
        await db.collection('pending_payments').doc(response.id).set({
          plan: plan,
          preferenceId: response.id,
          status: 'pending',
          createdAt: new Date(),
          amount: selectedPlan.price,
          userEmail: userEmail,
          userName: userName
        });
      } catch (dbError) {
        console.error('Error guardando en Firebase:', dbError.message);
        // No fallar la request por esto
      }
    }

    res.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      plan: selectedPlan,
      environment: process.env.MERCADOPAGO_ENVIRONMENT || 'sandbox'
    });

  } catch (error) {
    console.error('❌ Error creando suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando suscripción',
      message: error.message
    });
  }
});

// Webhook mejorado para procesar pagos
app.post('/api/subscription/webhook', async (req, res) => {
  try {
    console.log('📦 Webhook recibido de MercadoPago:', JSON.stringify(req.body, null, 2));
    
    const { type, data, action } = req.body;

    // Responder rápidamente a MercadoPago (importante)
    res.status(200).json({ received: true });

    // Procesar la notificación de forma asíncrona
    if (type === 'payment') {
      console.log('💳 Procesando notificación de pago:', data.id);
      
      // Aquí implementarías la lógica para:
      // 1. Obtener detalles del pago con data.id
      // 2. Verificar el estado del pago
      // 3. Activar suscripción del usuario
      // 4. Enviar email de confirmación
      
      // Por ahora solo guardamos el evento
      if (firebaseInitialized) {
        try {
          await db.collection('webhook_events').add({
            type: type,
            paymentId: data.id,
            action: action,
            receivedAt: new Date(),
            processed: false
          });
          console.log('✅ Evento de webhook guardado en Firebase');
        } catch (dbError) {
          console.error('Error guardando webhook:', dbError.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase: ${firebaseInitialized ? '✅ Conectado' : '❌ Desconectado'}`);
  console.log(`💳 MercadoPago: ${process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`📍 URLs disponibles:`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Debug: http://localhost:${PORT}/debug-env`);
  console.log(`   Firebase: http://localhost:${PORT}/test-firebase`);
  console.log(`   MercadoPago: http://localhost:${PORT}/test-mercadopago-config`);
});