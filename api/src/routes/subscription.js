const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyAuth } = require('../middleware/auth');

// POST /api/subscription/create - Crear nueva suscripción
router.post('/create', verifyAuth, subscriptionController.createSubscription);

// POST /api/subscription/webhook - Webhook de MercadoPago
router.post('/webhook', subscriptionController.webhook);

// GET /api/subscription/status - Verificar estado de suscripción
router.get('/status', verifyAuth, subscriptionController.checkSubscriptionStatus);

// POST /api/subscription/cancel - Cancelar suscripción
router.post('/cancel', verifyAuth, subscriptionController.cancelSubscription);

module.exports = router;