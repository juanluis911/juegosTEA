// ⚡ JuegoTEA API Server - Configuración completa con webhook MercadoPago
// 🧩 Plataforma educativa para niños con TEA

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const path = require('path');

// === CONFIGURACIÓN INICIAL ===
const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIGURACIÓN DE BASE DE DATOS SIMPLE (JSON) ===
const DB_PATH = path.join(__dirname, 'data');
const PAYMENTS_FILE = path.join(DB_PATH, 'payments.json');
const SUBSCRIPTIONS_FILE = path.join(DB_PATH, 'subscriptions.json');

// === PLANES DISPONIBLES ===
const SUBSCRIPTION_PLANS = {
  premium: {
    id: 'juegotea_premium',
    title: 'JuegoTEA Premium',
    description: 'Acceso completo a todos los juegos y funcionalidades premium',
    unit_price: 49, // 
    currency_id: 'MXN',
    duration_days: 30
  },
  annual: {
    id: 'juegotea_annual',
    title: 'JuegoTEA Anual',
    description: 'Suscripción anual con descuento - Acceso completo por 12 meses',
    unit_price: 499, // 
    currency_id: 'MXN',
    duration_days: 365
  }
};


// === INICIALIZAR CARPETA DE DATOS ===
async function initializeDataFolder() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(DB_PATH, { recursive: true });
    log('info', 'DB', 'Carpeta de datos creada');
  }
  
  // Inicializar archivos si no existen
  try {
    await fs.access(PAYMENTS_FILE);
  } catch {
    await fs.writeFile(PAYMENTS_FILE, JSON.stringify([], null, 2));
    log('info', 'DB', 'Archivo de pagos inicializado');
  }
  
  try {
    await fs.access(SUBSCRIPTIONS_FILE);
  } catch {
    await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2));
    log('info', 'DB', 'Archivo de suscripciones inicializado');
  }
}

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
    validation: '🛡️',
    db: '💾',
    payment: '💰'
  };

  const prefix = logPrefix[level] || '📝';
  console.log(`${prefix} [${timestamp}] [${requestId || 'SYSTEM'}] ${message}`);
  
  if (data) {
    console.log(`   📊 Data:`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

// === FUNCIONES DE BASE DE DATOS ===
async function savePayment(paymentData) {
  try {
    const payments = JSON.parse(await fs.readFile(PAYMENTS_FILE, 'utf8'));
    payments.push({
      ...paymentData,
      saved_at: new Date().toISOString(),
      id: paymentData.id || Date.now().toString()
    });
    await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
    return true;
  } catch (error) {
    log('error', 'DB', 'Error guardando pago', error);
    return false;
  }
}

async function updateSubscription(userEmail, subscriptionData) {
  try {
    const subscriptions = JSON.parse(await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8'));
    const existingIndex = subscriptions.findIndex(sub => sub.email === userEmail);
    
    const newSubscription = {
      email: userEmail,
      ...subscriptionData,
      updated_at: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      subscriptions[existingIndex] = newSubscription;
    } else {
      subscriptions.push(newSubscription);
    }
    
    await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
    return true;
  } catch (error) {
    log('error', 'DB', 'Error actualizando suscripción', error);
    return false;
  }
}

async function getSubscription(userEmail) {
  try {
    const subscriptions = JSON.parse(await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8'));
    return subscriptions.find(sub => sub.email === userEmail) || null;
  } catch (error) {
    log('error', 'DB', 'Error obteniendo suscripción', error);
    return null;
  }
}

// === VALIDACIÓN Y CONFIGURACIÓN DE MERCADOPAGO ===
function validateMercadoPagoConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    return {
      valid: false,
      error: 'Token de acceso de MercadoPago no configurado',
      suggestion: 'Configura MERCADOPAGO_ACCESS_TOKEN en las variables de entorno'
    };
  }
  
  const tokenType = accessToken.startsWith('TEST-') ? 'SANDBOX' : 
                   accessToken.startsWith('APP_USR-') ? 'PRODUCTION' : 'UNKNOWN';
  
  return {
    valid: true,
    tokenType: tokenType,
    environment: tokenType === 'SANDBOX' ? 'testing' : 'production'
  };
}

// === CONFIGURACIÓN DE MERCADOPAGO ===
let mercadopagoClient = null;
let mercadopagoConfig = validateMercadoPagoConfig();

if (mercadopagoConfig.valid) {
  try {
    const { MercadoPagoConfig, Payment } = require('mercadopago');
    mercadopagoClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
    log('success', 'CONFIG', `MercadoPago configurado en modo ${mercadopagoConfig.environment}`);
  } catch (error) {
    log('error', 'CONFIG', 'Error configurando MercadoPago', error);
    mercadopagoConfig.valid = false;
  }
}

// === INICIALIZACIÓN DEL SERVIDOR ===
async function initializeServer() {
  await initializeDataFolder();
  
  log('server', 'INIT', 'Iniciando JuegoTEA API Server...');
  log('info', 'INIT', `Entorno: ${process.env.NODE_ENV || 'development'}`);
  log('info', 'INIT', `Puerto: ${PORT}`);
}

// === MIDDLEWARE ===
app.use(helmet());
app.use(compression());

// Middleware especial para webhook (raw body)
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

// Middleware normal para otras rutas
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de Request ID
app.use((req, res, next) => {
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  log('info', req.requestId, `${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100)
  });
  next();
});

// CORS configurado
const allowedOrigins = [
  'https://juegostea.onrender.com',
  'https://juegotea.netlify.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Demasiadas peticiones',
    details: 'Intenta de nuevo en 15 minutos'
  }
});

app.use('/api/', limiter);

// === WEBHOOK DE MERCADOPAGO MEJORADO ===
app.post('/api/subscription/webhook', async (req, res) => {
  try {
    log('webhook', req.requestId, 'Webhook recibido de MercadoPago', {
      query: req.query,
      headers: {
        'content-type': req.get('content-type'),
        'user-agent': req.get('user-agent'),
        'x-signature': req.get('x-signature'),
        'x-request-id': req.get('x-request-id')
      }
    });
    
    const { data, type } = req.query;
    
    if (!data || !type) {
      log('warning', req.requestId, 'Webhook sin topic o id válido', { topic, id });
      return res.status(400).json({
        success: false,
        error: 'Webhook inválido: faltan parámetros topic o id'
      });
    }
    
    log('webhook', req.requestId, `Procesando webhook - Topic: ${topic}, ID: ${id}`);
    
    if (type === 'subscription_authorized_payment' && mercadopagoConfig.valid) {
      try {
        // Obtener detalles del pago desde MercadoPago
        const { Payment } = require('mercadopago');
        const payment = new Payment(mercadopagoClient);
        
        log('payment', req.requestId, `Obteniendo detalles del pago: ${data.id}`);
        
        const paymentDetails = await payment.get({ id: data.id });
        
        log('payment', req.requestId, 'Detalles del pago obtenidos', {
          id: paymentDetails.id,
          status: paymentDetails.status,
          status_detail: paymentDetails.status_detail,
          external_reference: paymentDetails.external_reference,
          transaction_amount: paymentDetails.transaction_amount,
          payer_email: paymentDetails.payer?.email
        });
        
        // Guardar información del pago
        const paymentData = {
          payment_id: paymentDetails.id,
          status: paymentDetails.status,
          status_detail: paymentDetails.status_detail,
          external_reference: paymentDetails.external_reference,
          transaction_amount: paymentDetails.transaction_amount,
          currency_id: paymentDetails.currency_id,
          payment_method_id: paymentDetails.payment_method_id,
          payer_email: paymentDetails.payer?.email,
          payer_identification: paymentDetails.payer?.identification,
          date_created: paymentDetails.date_created,
          date_approved: paymentDetails.date_approved,
          webhook_received_at: new Date().toISOString(),
          raw_data: paymentDetails
        };
        
        const saved = await savePayment(paymentData);
        
        if (saved) {
          log('success', req.requestId, 'Pago guardado en base de datos');
          
          // Si el pago fue aprobado, actualizar suscripción
          if (paymentDetails.status === 'approved' && paymentDetails.payer?.email) {
            const subscriptionData = {
              status: 'active',
              plan: 'premium', // Extraer del external_reference si es necesario
              payment_id: paymentDetails.id,
              amount_paid: paymentDetails.transaction_amount,
              currency: paymentDetails.currency_id,
              payment_method: paymentDetails.payment_method_id,
              activated_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
              external_reference: paymentDetails.external_reference
            };
            
            const subscriptionUpdated = await updateSubscription(
              paymentDetails.payer.email, 
              subscriptionData
            );
            
            if (subscriptionUpdated) {
              log('success', req.requestId, 'Suscripción activada', {
                email: paymentDetails.payer.email,
                plan: subscriptionData.plan
              });
            }
          }
        }
        
      } catch (paymentError) {
        log('error', req.requestId, 'Error procesando pago', {
          message: paymentError.message,
          cause: paymentError.cause,
          id: id
        });
        
        // Aún así respondemos OK para evitar que MercadoPago reintente
        return res.status(200).json({ 
          received: true,
          error: 'Error procesando pago pero webhook recibido',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        });
      }
    }
    
    const response = { 
      received: true,
      topic: topic,
      id: id,
      processed: topic === 'payment',
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
    
    // Importante: siempre responder 200 para que MercadoPago no reintente
    res.status(200).json({ 
      error: 'Error procesando webhook pero recibido',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// === ENDPOINT DE ESTADO DE SUSCRIPCIÓN MEJORADO ===
app.get('/api/subscription/status', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido',
        requestId: req.requestId
      });
    }
    
    log('info', req.requestId, `Consultando estado de suscripción para: ${email}`);
    
    const subscription = await getSubscription(email);
    
    if (!subscription) {
      return res.json({
        success: true,
        has_subscription: false,
        status: 'inactive',
        message: 'No hay suscripción activa',
        requestId: req.requestId
      });
    }
    
    // Verificar si la suscripción ha expirado
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const isExpired = now > expiresAt;
    
    const response = {
      success: true,
      has_subscription: true,
      status: isExpired ? 'expired' : subscription.status,
      plan: subscription.plan,
      activated_at: subscription.activated_at,
      expires_at: subscription.expires_at,
      days_remaining: isExpired ? 0 : Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)),
      payment_method: subscription.payment_method,
      requestId: req.requestId
    };
    
    log('success', req.requestId, 'Estado de suscripción consultado', response);
    res.json(response);
    
  } catch (error) {
    log('error', req.requestId, 'Error consultando suscripción', error);
    res.status(500).json({
      success: false,
      error: 'Error consultando estado de suscripción',
      requestId: req.requestId
    });
  }
});

// === ENDPOINT CREAR SUSCRIPCIÓN MEJORADO ===
app.post('/api/subscription/create', async (req, res) => {
  try {
    log('mercadopago', req.requestId, 'Iniciando creación de suscripción...');
    log('debug', req.requestId, 'Body recibido', req.body);

    // Verificar configuración de MercadoPago
    if (!mercadopagoConfig.valid) {
      log('error', req.requestId, 'MercadoPago no configurado');
      return res.status(500).json({
        success: false,
        error: 'Servicio de pagos no disponible',
        details: mercadopagoConfig.error,
        requestId: req.requestId
      });
    }

    // Validar datos requeridos
    const { plan, userEmail, userName } = req.body;
    
    if (!plan || !userEmail) {
      log('validation', req.requestId, 'Datos faltantes', { plan, userEmail, userName });
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        required: ['plan', 'userEmail'],
        received: { plan: !!plan, userEmail: !!userEmail, userName: !!userName },
        requestId: req.requestId
      });
    }

    // Validar plan
    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    if (!selectedPlan) {
      log('validation', req.requestId, `Plan inválido: ${plan}`);
      return res.status(400).json({
        success: false,
        error: 'Plan de suscripción inválido',
        available_plans: Object.keys(SUBSCRIPTION_PLANS),
        requested_plan: plan,
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

    // Configuración de preferencia
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
        name: userName || 'Usuario JuegoTEA',
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
        user_name: userName || 'Usuario JuegoTEA',
        plan: plan,
        duration_days: selectedPlan.duration_days,
        created_at: new Date().toISOString(),
        source: 'juegotea_web',
        version: '1.1.0'
      }
    };

    log('debug', req.requestId, 'Datos de preferencia preparados', preferenceData);

    // Crear preferencia
    try {
      const { Preference } = require('mercadopago');
      const preference = new Preference(mercadopagoClient);
      
      log('mercadopago', req.requestId, 'Enviando solicitud a MercadoPago...');
      
      const result = await preference.create({
        body: preferenceData
      });

      log('success', req.requestId, 'Preferencia creada exitosamente', {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      });

      // Respuesta exitosa
      const response = {
        success: true,
        preference_id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        external_reference: externalReference,
        plan_details: selectedPlan,
        expires_at: expirationDate.toISOString(),
        requestId: req.requestId
      };

      res.json(response);

    } catch (mpError) {
      log('error', req.requestId, 'Error de MercadoPago', {
        message: mpError.message,
        cause: mpError.cause,
        status: mpError.status
      });

      res.status(500).json({
        success: false,
        error: 'Error creando preferencia de pago',
        details: mpError.message,
        requestId: req.requestId
      });
    }

  } catch (error) {
    log('error', req.requestId, 'Error general en creación de suscripción', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error procesando la suscripción',
      requestId: req.requestId
    });
  }
});

// === ENDPOINT PARA OBTENER PLANES DISPONIBLES ===
app.get('/api/subscription/plans', (req, res) => {
  log('info', req.requestId, 'Consultando planes disponibles');
  
  res.json({
    success: true,
    plans: SUBSCRIPTION_PLANS,
    count: Object.keys(SUBSCRIPTION_PLANS).length,
    currency: 'ARS',
    requestId: req.requestId
  });
});

// === ENDPOINT PARA VALIDAR SUSCRIPCIÓN ACTIVA ===
app.post('/api/subscription/validate', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido',
        requestId: req.requestId
      });
    }
    
    log('info', req.requestId, `Validando suscripción activa para: ${email}`);
    
    const subscription = await getSubscription(email);
    
    if (!subscription) {
      return res.json({
        success: true,
        is_active: false,
        has_subscription: false,
        message: 'No hay suscripción registrada',
        requestId: req.requestId
      });
    }
    
    // Verificar si la suscripción está activa y no ha expirado
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const isActive = subscription.status === 'active' && now <= expiresAt;
    
    const response = {
      success: true,
      is_active: isActive,
      has_subscription: true,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        activated_at: subscription.activated_at,
        expires_at: subscription.expires_at,
        days_remaining: isActive ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)) : 0,
        payment_method: subscription.payment_method
      },
      requestId: req.requestId
    };
    
    log('success', req.requestId, 'Validación de suscripción completada', {
      email: email,
      is_active: isActive,
      plan: subscription.plan
    });
    
    res.json(response);
    
  } catch (error) {
    log('error', req.requestId, 'Error validando suscripción', error);
    res.status(500).json({
      success: false,
      error: 'Error validando suscripción',
      requestId: req.requestId
    });
  }
});

// === ENDPOINT PARA CANCELAR SUSCRIPCIÓN ===
app.post('/api/subscription/cancel', async (req, res) => {
  try {
    const { email, reason } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido',
        requestId: req.requestId
      });
    }
    
    log('info', req.requestId, `Cancelando suscripción para: ${email}`, { reason });
    
    const subscription = await getSubscription(email);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró suscripción para cancelar',
        requestId: req.requestId
      });
    }
    
    // Marcar como cancelada
    const canceledSubscription = {
      ...subscription,
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      cancellation_reason: reason || 'User request',
      // Mantener la fecha de expiración original
      // expires_at: subscription.expires_at
    };
    
    const updated = await updateSubscription(email, canceledSubscription);
    
    if (updated) {
      log('success', req.requestId, 'Suscripción cancelada exitosamente', {
        email: email,
        previous_status: subscription.status
      });
      
      res.json({
        success: true,
        message: 'Suscripción cancelada exitosamente',
        subscription: {
          status: 'canceled',
          canceled_at: canceledSubscription.canceled_at,
          access_until: subscription.expires_at // Mantiene acceso hasta expiración
        },
        requestId: req.requestId
      });
    } else {
      throw new Error('Error actualizando estado de suscripción');
    }
    
  } catch (error) {
    log('error', req.requestId, 'Error cancelando suscripción', error);
    res.status(500).json({
      success: false,
      error: 'Error cancelando suscripción',
      requestId: req.requestId
    });
  }
});

// === ENDPOINT PARA HISTORIAL DE PAGOS DE UN USUARIO ===
app.get('/api/subscription/history', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido',
        requestId: req.requestId
      });
    }
    
    log('info', req.requestId, `Consultando historial de pagos para: ${email}`);
    
    // Leer historial de pagos
    const payments = JSON.parse(await fs.readFile(PAYMENTS_FILE, 'utf8'));
    const userPayments = payments.filter(payment => 
      payment.payer_email === email
    ).sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    
    // Obtener suscripción actual
    const currentSubscription = await getSubscription(email);
    
    const response = {
      success: true,
      email: email,
      current_subscription: currentSubscription,
      payment_history: userPayments.map(payment => ({
        payment_id: payment.payment_id,
        status: payment.status,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        payment_method: payment.payment_method_id,
        date: payment.date_created,
        external_reference: payment.external_reference
      })),
      total_payments: userPayments.length,
      requestId: req.requestId
    };
    
    log('success', req.requestId, 'Historial consultado', {
      email: email,
      payments_count: userPayments.length
    });
    
    res.json(response);
    
  } catch (error) {
    log('error', req.requestId, 'Error consultando historial', error);
    res.status(500).json({
      success: false,
      error: 'Error consultando historial de pagos',
      requestId: req.requestId
    });
  }
});

// === ENDPOINT DE ESTADÍSTICAS (SOLO ADMIN) ===
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/admin/stats', async (req, res) => {
    try {
      log('info', req.requestId, 'Consultando estadísticas admin');
      
      const payments = JSON.parse(await fs.readFile(PAYMENTS_FILE, 'utf8'));
      const subscriptions = JSON.parse(await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8'));
      
      const now = new Date();
      const activeSubscriptions = subscriptions.filter(sub => 
        sub.status === 'active' && new Date(sub.expires_at) > now
      );
      
      const stats = {
        success: true,
        payments: {
          total: payments.length,
          approved: payments.filter(p => p.status === 'approved').length,
          pending: payments.filter(p => p.status === 'pending').length,
          rejected: payments.filter(p => p.status === 'rejected').length,
          total_amount: payments
            .filter(p => p.status === 'approved')
            .reduce((sum, p) => sum + (p.transaction_amount || 0), 0)
        },
        subscriptions: {
          total: subscriptions.length,
          active: activeSubscriptions.length,
          expired: subscriptions.filter(sub => 
            sub.status === 'active' && new Date(sub.expires_at) <= now
          ).length,
          canceled: subscriptions.filter(sub => sub.status === 'canceled').length
        },
        plans: {
          premium: subscriptions.filter(sub => sub.plan === 'premium').length,
          annual: subscriptions.filter(sub => sub.plan === 'annual').length
        },
        recent_activity: {
          payments_last_24h: payments.filter(p => 
            new Date(p.webhook_received_at) > new Date(now - 24 * 60 * 60 * 1000)
          ).length,
          new_subscriptions_last_7d: subscriptions.filter(sub => 
            new Date(sub.activated_at) > new Date(now - 7 * 24 * 60 * 60 * 1000)
          ).length
        },
        timestamp: now.toISOString(),
        requestId: req.requestId
      };
      
      log('success', req.requestId, 'Estadísticas generadas', {
        total_payments: stats.payments.total,
        active_subscriptions: stats.subscriptions.active
      });
      
      res.json(stats);
      
    } catch (error) {
      log('error', req.requestId, 'Error generando estadísticas', error);
      res.status(500).json({
        success: false,
        error: 'Error generando estadísticas',
        requestId: req.requestId
      });
    }
  });
}
// === ENDPOINTS ADICIONALES PARA GESTIÓN ===

// Listar todos los pagos (solo para desarrollo/testing)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/admin/payments', async (req, res) => {
    try {
      const payments = JSON.parse(await fs.readFile(PAYMENTS_FILE, 'utf8'));
      res.json({
        success: true,
        count: payments.length,
        payments: payments.slice(-10), // Solo los últimos 10
        requestId: req.requestId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo pagos',
        requestId: req.requestId
      });
    }
  });
  
  app.get('/api/admin/subscriptions', async (req, res) => {
    try {
      const subscriptions = JSON.parse(await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8'));
      res.json({
        success: true,
        count: subscriptions.length,
        subscriptions: subscriptions,
        requestId: req.requestId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo suscripciones',
        requestId: req.requestId
      });
    }
  });
}

// === OTROS ENDPOINTS (mantener los existentes) ===
app.get('/', (req, res) => {
  res.json({
    name: 'JuegoTEA API',
    version: '1.1.0',
    description: 'API para plataforma educativa de niños con TEA',
    status: 'operational',
    webhook_configured: true,
    database: 'json_files',
    endpoints: {
      health: '/health',
      subscription_create: '/api/subscription/create',
      subscription_status: '/api/subscription/status',
      webhook: '/api/subscription/webhook'
    },
    requestId: req.requestId
  });
});

app.get('/health', async (req, res) => {
  try {
    // Verificar que los archivos de datos existan
    await fs.access(PAYMENTS_FILE);
    await fs.access(SUBSCRIPTIONS_FILE);
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'operational',
      mercadopago: mercadopagoConfig?.valid ? 'configured' : 'not_configured',
      webhook: 'configured',
      requestId: req.requestId
    };
    
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database files not accessible',
      requestId: req.requestId
    });
  }
});

// === MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS ===
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    requestId: req.requestId
  });
});

app.use((err, req, res, next) => {
  log('error', req.requestId || 'unknown', 'Error no controlado', err);
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    requestId: req.requestId
  });
});

// === INICIAR SERVIDOR ===
initializeServer().then(() => {
  const server = app.listen(PORT, () => {
    log('server', 'STARTUP', '='.repeat(80));
    log('server', 'STARTUP', `🎯 JuegoTEA API Server iniciado exitosamente`);
    log('server', 'STARTUP', `🌐 Puerto: ${PORT}`);
    log('server', 'STARTUP', `💳 MercadoPago: ${mercadopagoConfig?.valid ? '✅ Configurado' : '❌ No configurado'}`);
    log('server', 'STARTUP', `🔔 Webhook: ✅ Configurado`);
    log('server', 'STARTUP', `💾 Base de datos: ✅ JSON Files`);
    log('server', 'STARTUP', '='.repeat(80));
  });
}).catch(error => {
  log('error', 'STARTUP', 'Error iniciando servidor', error);
  process.exit(1);
});