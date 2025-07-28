const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// === WEBHOOK BÁSICO ===

// Basic webhook endpoint
app.post('/api/subscription/webhook', (req, res) => {
  console.log('📦 Webhook recibido:', req.body);
  res.status(200).json({ received: true, timestamp: new Date().toISOString() });
});

// Test webhook
app.post('/test-webhook', (req, res) => {
  console.log('🧪 Test webhook:', req.body);
  res.json({ 
    success: true, 
    message: 'Webhook de prueba recibido',
    timestamp: new Date().toISOString(),
    body: req.body
  });
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