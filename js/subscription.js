// js/subscription.js - URL corregida

class SubscriptionManager {
  constructor() {
    // 🔧 CORREGIR: URL sin doble slash y con el nombre correcto
    this.apiUrl = 'https://api-juegostea.onrender.com'; // Cambiar por tu URL real
    this.loading = false;
    
    // Detectar si estamos en desarrollo local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.apiUrl = 'http://localhost:3000/api';
      console.log('🔧 Modo desarrollo: usando API local');
    }
    
    console.log('🌐 API URL configurada:', this.apiUrl);
  }

  // Crear suscripción con mejor manejo de errores
  async createSubscription() {
    if (this.loading) return;

    const userEmail = document.getElementById('userEmail')?.value.trim();
    const userName = document.getElementById('userName')?.value.trim();

    // Validaciones
    if (!userEmail || !userName) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    if (!this.isValidEmail(userEmail)) {
      this.showError('Por favor ingresa un email válido');
      return;
    }

    try {
      this.loading = true;
      this.updateButtonLoading(true);

      console.log('📤 Enviando request a:', `${this.apiUrl}/subscription/create`);

      const response = await fetch(`${this.apiUrl}/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'premium',
          userEmail: userEmail,
          userName: userName
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Subscription response:', data);

      if (data.success) {
        // Redirigir a MercadoPago
        const checkoutUrl = data.environment === 'sandbox' ? 
          data.sandbox_init_point : 
          data.init_point;
        
        if (checkoutUrl) {
          // Guardar datos para después del pago
          localStorage.setItem('pendingSubscription', JSON.stringify({
            preferenceId: data.preference_id,
            email: userEmail,
            name: userName,
            plan: data.plan,
            timestamp: new Date().toISOString()
          }));

          console.log('🔄 Redirigiendo a:', checkoutUrl);
          window.location.href = checkoutUrl;
        } else {
          throw new Error('No se recibió URL de checkout');
        }
      } else {
        throw new Error(data.error || 'Error desconocido');
      }

    } catch (error) {
      console.error('❌ Error en suscripción:', error);
      
      // Mensajes de error más específicos
      let userMessage = error.message;
      
      if (error.message.includes('404')) {
        userMessage = 'Servicio no disponible. Verifica que el backend esté funcionando.';
      } else if (error.message.includes('Failed to fetch')) {
        userMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message.includes('CORS')) {
        userMessage = 'Error de configuración. Contacta soporte.';
      }
      
      this.showError(userMessage);
    } finally {
      this.loading = false;
      this.updateButtonLoading(false);
    }
  }

  // Resto de métodos permanecen igual...
  showSubscriptionModal() {
    const existingModal = document.querySelector('.subscription-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'subscription-modal-overlay';
    modal.innerHTML = `
      <div class="subscription-modal">
        <div class="modal-header">
          <h2>🎮 JuegoTEA Premium</h2>
          <button class="close-modal" onclick="this.closest('.subscription-modal-overlay').remove()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="plan-card">
            <div class="plan-header">
              <h3>Plan Premium</h3>
              <div class="price">
                <span class="amount">$9.99</span>
                <span class="period">/mes</span>
              </div>
            </div>
            
            <div class="plan-features">
              <h4>✨ Lo que obtienes:</h4>
              <ul>
                <li>🎯 Acceso a todos los 16+ juegos especializados</li>
                <li>📊 Seguimiento detallado del progreso</li>
                <li>📈 Reportes personalizados para padres</li>
                <li>🎨 Configuración avanzada de dificultad</li>
                <li>📱 Sin anuncios ni interrupciones</li>
                <li>🆕 Acceso prioritario a nuevos juegos</li>
                <li>💬 Soporte técnico especializado</li>
              </ul>
            </div>

            <div class="plan-form">
              <div class="form-group">
                <label for="userEmail">📧 Email (para recibo):</label>
                <input type="email" id="userEmail" placeholder="tu@email.com" required>
              </div>
              
              <div class="form-group">
                <label for="userName">👤 Nombre:</label>
                <input type="text" id="userName" placeholder="Tu nombre" required>
              </div>
            </div>

            <div class="plan-actions">
              <button class="btn-subscribe" onclick="subscriptionManager.createSubscription()">
                <span class="btn-text">💳 Suscribirse Ahora</span>
                <span class="btn-loader" style="display: none;">⏳ Procesando...</span>
              </button>
              
              <div class="payment-info">
                <small>🔒 Pago seguro procesado por MercadoPago</small>
                <div class="payment-methods">
                  <span>💳 Visa</span>
                  <span>💳 Mastercard</span>
                  <span>💳 American Express</span>
                </div>
              </div>
            </div>

            <div class="plan-guarantee">
              <p>✅ <strong>Garantía:</strong> Cancela cuando quieras, sin compromisos</p>
              <p>🎯 <strong>Especializado:</strong> Diseñado específicamente para niños con TEA</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.addEventListener('keydown', this.handleEscapeKey);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.removeEventListener('keydown', this.handleEscapeKey);
      }
    });
  }

  handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      const modal = document.querySelector('.subscription-modal-overlay');
      if (modal) {
        modal.remove();
        document.removeEventListener('keydown', this.handleEscapeKey);
      }
    }
  }

  updateButtonLoading(loading) {
    const btn = document.querySelector('.btn-subscribe');
    const text = btn?.querySelector('.btn-text');
    const loader = btn?.querySelector('.btn-loader');

    if (btn && text && loader) {
      if (loading) {
        text.style.display = 'none';
        loader.style.display = 'inline';
        btn.disabled = true;
        btn.style.opacity = '0.7';
      } else {
        text.style.display = 'inline';
        loader.style.display = 'none';
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showError(message) {
    const existingError = document.querySelector('.subscription-error');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'subscription-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    const modal = document.querySelector('.subscription-modal');
    if (modal) {
      modal.insertBefore(errorDiv, modal.firstChild);
    } else {
      document.body.appendChild(errorDiv);
    }

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

// Instancia global
const subscriptionManager = new SubscriptionManager();

// Funciones globales
window.showSubscriptionModal = () => subscriptionManager.showSubscriptionModal();
window.subscriptionManager = subscriptionManager;