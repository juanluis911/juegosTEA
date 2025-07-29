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
        uid: 'test-user-' + Date.now(),
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
      
      // Simular proceso de suscripción
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Por ahora solo mostrar mensaje
      this.showSuccess('¡Funcionalidad de suscripción próximamente disponible!');
      
      // Cerrar modal
      const modal = document.querySelector('.subscription-modal-overlay');
      if (modal) modal.remove();
      
    } catch (error) {
      console.error('Error creando suscripción:', error);
      this.showError('Error al procesar la suscripción');
    } finally {
      this.showLoading(false);
    }
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