const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { db } = require('../config/firebase');

class SubscriptionController {
  constructor() {
    this.mercadopago = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
  }

  // Crear preferencia de pago
  async createSubscription(req, res) {
    try {
      const { uid } = req.user;
      const { plan = 'premium' } = req.body;

      // Verificar que el usuario existe
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const userData = userDoc.data();

      // Definir planes
      const plans = {
        premium: {
          title: 'JuegoTEA Premium',
          price: 9.99,
          currency: 'USD',
          description: 'Acceso completo a todos los juegos y funcionalidades'
        }
      };

      const selectedPlan = plans[plan];
      if (!selectedPlan) {
        return res.status(400).json({ error: 'Plan no válido' });
      }

      // Crear preferencia de MercadoPago
      const preference = new Preference(this.mercadopago);
      
      const preferenceData = {
        items: [{
          id: `plan-${plan}`,
          title: selectedPlan.title,
          description: selectedPlan.description,
          unit_price: selectedPlan.price,
          quantity: 1,
          currency_id: selectedPlan.currency
        }],
        payer: {
          email: userData.email,
          name: userData.name
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/subscription/success`,
          failure: `${process.env.FRONTEND_URL}/subscription/failure`,
          pending: `${process.env.FRONTEND_URL}/subscription/pending`
        },
        notification_url: `${process.env.API_URL}/api/subscription/webhook`,
        external_reference: uid,
        metadata: {
          user_id: uid,
          plan: plan,
          created_at: new Date().toISOString()
        },
        auto_return: 'approved'
      };

      const response = await preference.create({ body: preferenceData });

      // Guardar referencia del pago pendiente
      await db.collection('pending_payments').doc(response.id).set({
        userId: uid,
        plan: plan,
        preferenceId: response.id,
        status: 'pending',
        createdAt: new Date(),
        amount: selectedPlan.price
      });

      res.json({
        success: true,
        preference_id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point
      });

    } catch (error) {
      console.error('Error creando suscripción:', error);
      res.status(500).json({ 
        error: 'Error creando suscripción',
        message: error.message 
      });
    }
  }

  // Webhook de MercadoPago
  async webhook(req, res) {
    try {
      const { type, data } = req.body;

      console.log('📦 Webhook recibido:', { type, data });

      if (type === 'payment') {
        const paymentId = data.id;
        
        // Obtener detalles del pago
        const payment = new Payment(this.mercadopago);
        const paymentInfo = await payment.get({ id: paymentId });

        const { 
          status, 
          external_reference: userId, 
          transaction_amount,
          metadata 
        } = paymentInfo;

        console.log('💳 Info del pago:', { 
          status, 
          userId, 
          amount: transaction_amount 
        });

        if (status === 'approved' && userId) {
          await this.activateSubscription(userId, metadata.plan || 'premium');
        }

        // Actualizar estado del pago pendiente
        const pendingPaymentQuery = await db.collection('pending_payments')
          .where('userId', '==', userId)
          .where('status', '==', 'pending')
          .limit(1)
          .get();

        if (!pendingPaymentQuery.empty) {
          const doc = pendingPaymentQuery.docs[0];
          await doc.ref.update({
            status: status,
            paymentId: paymentId,
            processedAt: new Date()
          });
        }
      }

      res.status(200).json({ received: true });

    } catch (error) {
      console.error('❌ Error en webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }

  // Activar suscripción
  async activateSubscription(userId, plan = 'premium') {
    try {
      const userRef = db.collection('users').doc(userId);
      
      // Calcular fecha de expiración (30 días)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await userRef.update({
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        subscriptionExpiry: expiryDate,
        subscriptionActivatedAt: new Date()
      });

      console.log(`✅ Suscripción activada para usuario: ${userId}`);

      // Aquí podrías enviar email de confirmación
      // await this.sendSubscriptionConfirmationEmail(userId);

    } catch (error) {
      console.error('Error activando suscripción:', error);
      throw error;
    }
  }

  // Verificar estado de suscripción
  async checkSubscriptionStatus(req, res) {
    try {
      const { uid } = req.user;

      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const userData = userDoc.data();
      const now = new Date();
      const expiry = userData.subscriptionExpiry?.toDate();

      let subscriptionStatus = 'free';
      let isActive = false;

      if (userData.subscriptionStatus === 'active' && expiry && expiry > now) {
        subscriptionStatus = 'active';
        isActive = true;
      } else if (userData.subscriptionStatus === 'active' && expiry && expiry <= now) {
        // Suscripción expirada
        await userRef.update({
          subscriptionStatus: 'expired',
          subscriptionExpiredAt: new Date()
        });
        subscriptionStatus = 'expired';
      }

      res.json({
        success: true,
        subscription: {
          status: subscriptionStatus,
          plan: userData.subscriptionPlan || 'free',
          expiry: expiry,
          isActive: isActive,
          daysRemaining: isActive ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : 0
        }
      });

    } catch (error) {
      console.error('Error verificando suscripción:', error);
      res.status(500).json({ error: 'Error verificando suscripción' });
    }
  }

  // Cancelar suscripción
  async cancelSubscription(req, res) {
    try {
      const { uid } = req.user;

      const userRef = db.collection('users').doc(uid);
      await userRef.update({
        subscriptionStatus: 'cancelled',
        subscriptionCancelledAt: new Date()
      });

      res.json({
        success: true,
        message: 'Suscripción cancelada correctamente'
      });

    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      res.status(500).json({ error: 'Error cancelando suscripción' });
    }
  }
}

module.exports = new SubscriptionController();