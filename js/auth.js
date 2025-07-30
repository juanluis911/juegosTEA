// js/auth.js - Sistema de autenticación frontend (versión simplificada)

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.subscriptionStatus = null;
    this.initialized = false;
    
    console.log('🔑 AuthManager creado');
  }

  async init() {
    try {
      console.log('🚀 Inicializando AuthManager...');
      
      // Simular carga de estado desde localStorage temporalmente
      const savedUser = localStorage.getItem('juegoTEA_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
      
      this.initialized = true;
      this.updateUI();
      
      console.log('✅ AuthManager inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando AuthManager:', error);
    }
  }

  async signInWithGoogle() {
    try {
      console.log('🔑 Simulando login con Google...');
      
      // POR AHORA: Simular usuario para testing
      this.currentUser = {
        uid: 'provicional-' + Date.now(),
        email: 'usuario@test.com',
        name: 'Usuario de Prueba',
        picture: 'https://via.placeholder.com/40'
      };
      
      // Guardar en localStorage temporalmente
      localStorage.setItem('juegoTEA_user', JSON.stringify(this.currentUser));
      
      this.updateUI();
      this.showSuccess('¡Bienvenido! Sesión iniciada correctamente.');
      
      console.log('✅ Login simulado exitoso:', this.currentUser);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      this.showError('Error al iniciar sesión');
    }
  }

  async signOut() {
    try {
      console.log('👋 Cerrando sesión...');
      
      this.currentUser = null;
      this.subscriptionStatus = null;
      
      // Limpiar localStorage
      localStorage.removeItem('juegoTEA_user');
      
      this.updateUI();
      this.showSuccess('Sesión cerrada correctamente');
      
      console.log('✅ Logout exitoso');
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      this.showError('Error al cerrar sesión');
    }
  }

  async checkSubscriptionStatus() {
    // Simular verificación de suscripción
    this.subscriptionStatus = {
      status: 'free',
      isActive: false,
      daysRemaining: 0
    };
    
    console.log('📋 Estado de suscripción:', this.subscriptionStatus);
  }

  updateUI() {
    console.log('🔄 Actualizando UI de autenticación...');
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    if (this.currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (userInfo) {
        userInfo.style.display = 'block';
        userInfo.innerHTML = `
          <img src="${this.currentUser.picture}" alt="Avatar" class="user-avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px;">
          <span>Hola, ${this.currentUser.name}</span>
        `;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'none';
    }

    this.updateSubscriptionInfo();
  }

  updateSubscriptionInfo() {
    const subscriptionInfo = document.getElementById('subscriptionInfo');
    
    if (!subscriptionInfo) return;

    if (this.currentUser && this.subscriptionStatus) {
      const { status, isActive, daysRemaining } = this.subscriptionStatus;
      
      let message = '';
      let className = '';

      if (isActive) {
        message = `Premium activo (${daysRemaining} días restantes)`;
        className = 'subscription-active';
      } else if (status === 'expired') {
        message = 'Suscripción expirada';
        className = 'subscription-expired';
      } else {
        message = 'Plan gratuito';
        className = 'subscription-free';
      }

      subscriptionInfo.innerHTML = `
        <span class="${className}" style="font-size: 12px; padding: 4px 8px; border-radius: 12px; background: #f7fafc;">${message}</span>
      `;
    } else {
      subscriptionInfo.innerHTML = '<span class="subscription-free" style="font-size: 12px; color: #718096;">Plan gratuito</span>';
    }
  }

  showLoading(show) {
    const loader = document.getElementById('authLoader');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  }

  showError(message) {
    console.error('❌ Error:', message);
    
    // Mostrar error en UI
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #fed7d7;
      color: #c53030;
      padding: 15px 25px;
      border-radius: 8px;
      border-left: 4px solid #c53030;
      box-shadow: 0 4px 12px rgba(197, 48, 48, 0.15);
      z-index: 10001;
      animation: slideIn 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 5000);
  }

  showSuccess(message) {
    console.log('✅ Éxito:', message);
    
    const successDiv = document.createElement('div');
    successDiv.className = 'auth-success';
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #c6f6d5;
      color: #2f855a;
      padding: 15px 25px;
      border-radius: 8px;
      border-left: 4px solid #48bb78;
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.15);
      z-index: 10001;
      animation: slideIn 0.3s ease-out;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  }

  // Modal de suscripción
  showSubscriptionModal() {
    console.log('🎮 Mostrando modal de suscripción...');
    
    const modal = document.createElement('div');
    modal.className = 'subscription-modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div class="subscription-modal" style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
      ">
        <div class="modal-header" style="text-align: center; margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0;">🎮 Desbloquea Todos los Juegos</h3>
          <button class="close-modal" onclick="this.closest('.subscription-modal-overlay').remove()" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #718096;
          ">×</button>
        </div>
        <div class="modal-body">
          <div class="plan-card" style="text-align: center;">
            <h4 style="color: #4299e1; margin-bottom: 15px;">Plan Premium</h4>
            <div class="price" style="font-size: 36px; font-weight: bold; color: #2d3748; margin-bottom: 20px;">
              $9.99<span style="font-size: 18px; color: #718096;">/mes</span>
            </div>
            <ul class="features" style="list-style: none; padding: 0; margin: 20px 0; text-align: left;">
              <li style="padding: 8px 0; color: #4a5568;">✅ Acceso a todos los 16 juegos</li>
              <li style="padding: 8px 0; color: #4a5568;">✅ Seguimiento detallado de progreso</li>
              <li style="padding: 8px 0; color: #4a5568;">✅ Reportes personalizados</li>
              <li style="padding: 8px 0; color: #4a5568;">✅ Sin anuncios</li>
              <li style="padding: 8px 0; color: #4a5568;">✅ Soporte prioritario</li>
            </ul>
            <button class="subscribe-btn" onclick="authManager.subscribe()" style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 50px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
              margin-top: 20px;
            ">
              Suscribirse Ahora
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  async subscribe() {
    try {
      console.log('💳 Procesando suscripción...');
      
      if (!this.currentUser) {
        this.showError('Debes iniciar sesión primero');
        return;
      }

      this.showLoading(true);
      
      // Crear modal de formulario de suscripción si no existe
      this.showSubscriptionForm();
      
    } catch (error) {
      console.error('Error iniciando suscripción:', error);
      this.showError('Error al iniciar el proceso de suscripción');
    } finally {
      this.showLoading(false);
    }
  }

  showSubscriptionForm() {
    // Remover modal existente si hay uno
    const existingModal = document.querySelector('.subscription-form-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'subscription-form-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div class="subscription-form-container" style="
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.4s ease-out;
      ">
        <button onclick="this.closest('.subscription-form-modal').remove()" style="
          position: absolute;
          top: 15px;
          right: 20px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 5px;
          line-height: 1;
        ">×</button>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px;">🚀 Obtener Premium</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Completa tus datos para acceder a todos los juegos</p>
        </div>

        <form class="subscription-form" onsubmit="authManager.processSubscription(event)" style="
          display: flex;
          flex-direction: column;
          gap: 20px;
        ">
          <div>
            <label for="userName" style="
              display: block;
              margin-bottom: 8px;
              color: #2d3748;
              font-weight: 600;
              font-size: 14px;
            ">Nombre completo *</label>
            <input 
              type="text" 
              id="userName" 
              name="userName"
              required
              placeholder="Ingresa tu nombre completo"
              style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.2s;
                box-sizing: border-box;
              "
              onfocus="this.style.borderColor='#667eea'"
              onblur="this.style.borderColor='#e2e8f0'"
            />
          </div>

          <div>
            <label for="userEmail" style="
              display: block;
              margin-bottom: 8px;
              color: #2d3748;
              font-weight: 600;
              font-size: 14px;
            ">Email *</label>
            <input 
              type="email" 
              id="userEmail" 
              name="userEmail"
              required
              placeholder="tu@email.com"
              value="${this.currentUser?.email || ''}"
              style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.2s;
                box-sizing: border-box;
              "
              onfocus="this.style.borderColor='#667eea'"
              onblur="this.style.borderColor='#e2e8f0'"
            />
          </div>

          <div style="
            background: #f7fafc;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          ">
            <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 18px;">Plan Premium</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 24px; font-weight: bold; color: #667eea;">$9.99 USD</span>
              <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">MENSUAL</span>
            </div>
            <ul style="list-style: none; padding: 0; margin: 0; color: #4a5568;">
              <li style="padding: 6px 0;">✅ Acceso a todos los 16 juegos</li>
              <li style="padding: 6px 0;">✅ Seguimiento detallado de progreso</li>
              <li style="padding: 6px 0;">✅ Reportes personalizados</li>
              <li style="padding: 6px 0;">✅ Sin anuncios</li>
              <li style="padding: 6px 0;">✅ Soporte prioritario</li>
            </ul>
          </div>

          <!-- Mensajes de error y éxito -->
          <div id="subscription-error" style="display: none;"></div>
          <div id="subscription-success" style="display: none;"></div>

          <button type="submit" class="btn-premium" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(102, 126, 234, 0.4)'" 
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            🚀 Obtener Premium
          </button>

          <p style="
            text-align: center;
            font-size: 12px;
            color: #666;
            margin: 10px 0 0 0;
            line-height: 1.4;
          ">
            🔒 Pago seguro con MercadoPago<br>
            Puedes cancelar en cualquier momento
          </p>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Enfocar el primer input
    setTimeout(() => {
      const firstInput = modal.querySelector('#userName');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  // Nuevo método para procesar la suscripción
  async processSubscription(event) {
    event.preventDefault();
    
    if (this.loading) {
      console.warn('⚠️ Operación ya en progreso, ignorando...');
      return;
    }

    console.log('🚀 Procesando suscripción...');

    const userEmail = document.getElementById('userEmail')?.value?.trim();
    const userName = document.getElementById('userName')?.value?.trim();

    // Validaciones
    if (!userEmail || !userName) {
      this.showSubscriptionError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!this.isValidEmail(userEmail)) {
      this.showSubscriptionError('Por favor ingresa un email válido');
      return;
    }

    if (userName.length < 2) {
      this.showSubscriptionError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    try {
      this.loading = true;
      this.updateSubscriptionButtonLoading(true);

      // Limpiar mensajes previos
      const errorDiv = document.getElementById('subscription-error');
      const successDiv = document.getElementById('subscription-success');
      if (errorDiv) errorDiv.style.display = 'none';
      if (successDiv) successDiv.style.display = 'none';

      console.log('📡 Enviando datos a la API...');

      // Llamar al endpoint de suscripción
      const response = await fetch('https://api-juegostea.onrender.com/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.currentUser?.accessToken ? `Bearer ${this.currentUser.accessToken}` : ''
        },
        body: JSON.stringify({
          plan: 'premium',
          userEmail: userEmail,
          userName: userName,
          userId: this.currentUser?.uid || null
        })
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parsing response:', parseError);
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('📨 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }

      if (data.success && (data.init_point || data.sandbox_init_point)) {
        // Determinar URL de checkout
        const checkoutUrl = data.environment === 'sandbox' || data.environment === 'development'
          ? data.sandbox_init_point
          : data.init_point;

        if (!checkoutUrl) {
          throw new Error('No se recibió URL de checkout de MercadoPago');
        }

        // Guardar datos de suscripción pendiente
        localStorage.setItem('pendingSubscription', JSON.stringify({
          userEmail,
          userName,
          plan: 'premium',
          timestamp: Date.now(),
          userId: this.currentUser?.uid
        }));

        this.showSubscriptionSuccess('¡Suscripción creada exitosamente! Redirigiendo a MercadoPago...');

        // Redirigir a MercadoPago después de un breve delay
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 2000);

      } else {
        throw new Error(data.message || 'Error desconocido al crear la suscripción');
      }

    } catch (error) {
      console.error('❌ Error creando suscripción:', error);
      
      let errorMessage = 'Error al procesar la suscripción. ';
      
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage += 'Verifica tu conexión a internet e intenta nuevamente.';
      } else if (error.message.includes('CORS')) {
        errorMessage += 'Error de configuración. Intenta más tarde.';
      } else {
        errorMessage += error.message;
      }
      
      this.showSubscriptionError(errorMessage);
    } finally {
      this.loading = false;
      this.updateSubscriptionButtonLoading(false);
    }
  }

  // Métodos auxiliares para el formulario de suscripción
  showSubscriptionError(message) {
    console.error('❌ Error de suscripción:', message);
    
    let errorDiv = document.getElementById('subscription-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'subscription-error';
      const form = document.querySelector('.subscription-form');
      if (form) {
        form.appendChild(errorDiv);
      }
    }
    
    errorDiv.style.cssText = `
      background: #fed7d7;
      border: 1px solid #fc8181;
      color: #c53030;
      padding: 12px;
      border-radius: 8px;
      margin: 10px 0;
      display: block;
      animation: slideIn 0.3s ease-out;
    `;
    
    errorDiv.innerHTML = `
      <strong>❌ Error:</strong> ${message}
      <button onclick="this.parentElement.style.display='none'" style="
        float: right; 
        background: none; 
        border: none; 
        color: #c53030; 
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0;
      ">×</button>
    `;
    
    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
      if (errorDiv) errorDiv.style.display = 'none';
    }, 8000);
  }

  showSubscriptionSuccess(message) {
    console.log('✅ Éxito de suscripción:', message);
    
    let successDiv = document.getElementById('subscription-success');
    if (!successDiv) {
      successDiv = document.createElement('div');
      successDiv.id = 'subscription-success';
      const form = document.querySelector('.subscription-form');
      if (form) {
        form.appendChild(successDiv);
      }
    }
    
    successDiv.style.cssText = `
      background: #c6f6d5;
      border: 1px solid #48bb78;
      color: #2f855a;
      padding: 12px;
      border-radius: 8px;
      margin: 10px 0;
      display: block;
      animation: slideIn 0.3s ease-out;
    `;
    
    successDiv.innerHTML = `<strong>✅ Éxito:</strong> ${message}`;
  }

  updateSubscriptionButtonLoading(loading) {
    const button = document.querySelector('.btn-premium');
    if (button) {
      if (loading) {
        button.disabled = true;
        button.innerHTML = '⏳ Procesando...';
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
      } else {
        button.disabled = false;
        button.innerHTML = '🚀 Obtener Premium';
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    }
  }

  // Método auxiliar para validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ✅ INSTANCIA GLOBAL DEL MANAGER DE AUTENTICACIÓN
const authManager = new AuthManager();

// ✅ FUNCIONES GLOBALES PARA LOS BOTONES
window.loginWithGoogle = () => authManager.signInWithGoogle();
window.logout = () => authManager.signOut();
window.showSubscriptionModal = () => authManager.showSubscriptionModal();

// ✅ INICIALIZAR CUANDO EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🔑 DOM cargado, inicializando AuthManager...');
  await authManager.init();
});

// ✅ DEBUG: Verificar que las funciones estén disponibles
setTimeout(() => {
  console.log('🔍 Verificando funciones globales:');
  console.log('- window.showSubscriptionModal:', typeof window.showSubscriptionModal);
  console.log('- authManager:', typeof authManager);
  console.log('- authManager.showSubscriptionModal:', typeof authManager?.showSubscriptionModal);
  console.log('- authManager.initialized:', authManager?.initialized);
}, 1000);