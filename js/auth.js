// js/auth.js - Sistema de autenticación frontend

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

class AuthManager {
  constructor() {
    // Configuración Firebase (obtener de tu console)
    const firebaseConfig = {
      apiKey: "AIzaSyBOiGcx...", // Tu API Key
      authDomain: "juegotea.firebaseapp.com",
      projectId: "juegotea",
      storageBucket: "juegotea.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef123456"
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.provider = new GoogleAuthProvider();
    this.currentUser = null;
    this.subscriptionStatus = null;

    this.init();
  }

  async init() {
    // Escuchar cambios en el estado de autenticación
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        await this.handleUserSignIn(user);
      } else {
        this.handleUserSignOut();
      }
    });
  }

  async handleUserSignIn(user) {
    try {
      // Obtener token de Firebase
      const token = await user.getIdToken();
      
      // Verificar con el backend
      const response = await apiClient.verifyToken(token);
      
      if (response.success) {
        this.currentUser = response.user;
        await this.checkSubscriptionStatus();
        this.updateUI();
        console.log('✅ Usuario autenticado:', this.currentUser.email);
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      this.showError('Error al iniciar sesión');
    }
  }

  handleUserSignOut() {
    this.currentUser = null;
    this.subscriptionStatus = null;
    this.updateUI();
    console.log('👋 Usuario desconectado');
  }

  async signInWithGoogle() {
    try {
      this.showLoading(true);
      
      const result = await signInWithPopup(this.auth, this.provider);
      // El resto se maneja en onAuthStateChanged
      
    } catch (error) {
      console.error('Error en login con Google:', error);
      this.showError('Error al iniciar sesión con Google');
    } finally {
      this.showLoading(false);
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
      await apiClient.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  async checkSubscriptionStatus() {
    try {
      const response = await apiClient.checkSubscriptionStatus();
      if (response.success) {
        this.subscriptionStatus = response.subscription;
      }
    } catch (error) {
      console.error('Error verificando suscripción:', error);
    }
  }

  // Verificar si el usuario tiene acceso a un juego
  async hasGameAccess(gameId) {
    try {
      const response = await apiClient.checkGameAccess(gameId);
      return response.hasAccess;
    } catch (error) {
      console.error('Error verificando acceso al juego:', error);
      return false;
    }
  }

  // UI Methods
  updateUI() {
    this.updateAuthButtons();
    this.updateUserInfo();
    this.updateSubscriptionInfo();
  }

  updateAuthButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    if (this.currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (userInfo) {
        userInfo.style.display = 'block';
        userInfo.innerHTML = `
          <img src="${this.currentUser.picture}" alt="Avatar" class="user-avatar">
          <span>Hola, ${this.currentUser.name}</span>
        `;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'none';
    }
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
        <span class="${className}">${message}</span>
      `;
    } else {
      subscriptionInfo.innerHTML = '<span class="subscription-free">Plan gratuito</span>';
    }
  }

  showLoading(show) {
    const loader = document.getElementById('authLoader');
    if (loader) {
      loader.style.display = show ? 'block' : 'none';
    }
  }

  showError(message) {
    // Mostrar error en UI
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 5000);
  }

  // Modal de suscripción
  showSubscriptionModal() {
    const modal = document.createElement('div');
    modal.className = 'subscription-modal-overlay';
    modal.innerHTML = `
      <div class="subscription-modal">
        <div class="modal-header">
          <h3>🎮 Desbloquea Todos los Juegos</h3>
          <button class="close-modal" onclick="this.closest('.subscription-modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="plan-card">
            <h4>Plan Premium</h4>
            <div class="price">$9.99<span>/mes</span></div>
            <ul class="features">
              <li>✅ Acceso a todos los 16 juegos</li>
              <li>✅ Seguimiento detallado de progreso</li>
              <li>✅ Reportes personalizados</li>
              <li>✅ Sin anuncios</li>
              <li>✅ Soporte prioritario</li>
            </ul>
            <button class="subscribe-btn" onclick="authManager.subscribe()">
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
      if (!this.currentUser) {
        this.showError('Debes iniciar sesión primero');
        return;
      }

      this.showLoading(true);
      
      const response = await apiClient.createSubscription('premium');
      
      if (response.success) {
        // Redirigir a MercadoPago
        window.location.href = response.init_point;
      }
      
    } catch (error) {
      console.error('Error creando suscripción:', error);
      this.showError('Error al procesar la suscripción');
    } finally {
      this.showLoading(false);
    }
  }
}

// Instancia global del manager de autenticación
const authManager = new AuthManager();

// Funciones globales para los botones
window.loginWithGoogle = () => authManager.signInWithGoogle();
window.logout = () => authManager.signOut();
window.showSubscriptionModal = () => authManager.showSubscriptionModal();