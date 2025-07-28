// js/subscription.js - Cliente de suscripciones corregido

class SubscriptionManager {
  constructor() {
    // 🔧 URL CORREGIDA - Debe coincidir con tu dominio de API en Render
    this.apiUrl = 'https://api-juegostea.onrender.com';
    this.loading = false;
    
    // Detectar si estamos en desarrollo local
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '5500') {
      this.apiUrl = 'http://localhost:3000';
      console.log('🔧 Modo desarrollo: usando API local');
    }
    
    console.log('🌐 API URL configurada:', this.apiUrl);
  }

  // Crear suscripción con mejor manejo de errores
  async createSubscription() {
    if (this.loading) {
      console.warn('⚠️ Ya hay una petición en proceso');
      return;
    }

    const userEmail = document.getElementById('userEmail')?.value.trim();
    const userName = document.getElementById('userName')?.value.trim();

    // Validaciones del lado del cliente
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

      const endpoint = `${this.apiUrl}/api/subscription/create`;
      console.log('📤 Enviando request a:', endpoint);

      const requestData = {
        plan: 'premium',
        userEmail: userEmail,
        userName: userName
      };

      console.log('📋 Datos a enviar:', requestData);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      // Manejar diferentes tipos de respuesta
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.error('❌ Respuesta no JSON:', textResponse);
        throw new Error('El servidor no devolvió una respuesta JSON válida');
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('✅ Subscription response:', data);

      if (data.success && (data.init_point || data.sandbox_init_point)) {
        // Determinar qué URL usar según el ambiente
        const checkoutUrl = data.environment === 'sandbox' ? 
          data.sandbox_init_point : 
          data.init_point;

        console.log('🔗 Redirigiendo a checkout:', checkoutUrl);
        
        // Mostrar mensaje de éxito
        this.showSuccess('¡Suscripción creada! Redirigiendo al checkout...');
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1500);
        
      } else {
        throw new Error(data.message || 'No se pudo crear la preferencia de pago');
      }

    } catch (error) {
      console.error('❌ Error creando suscripción:', error);
      
      // Mostrar errores específicos según el tipo
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        this.showError('Error de conexión. Verifica tu conexión a internet.');
      } else if (error.message.includes('CORS')) {
        this.showError('Error de configuración del servidor. Intenta más tarde.');
      } else {
        this.showError(error.message || 'Error al procesar la suscripción');
      }
    } finally {
      this.loading = false;
      this.updateButtonLoading(false);
    }
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Actualizar estado del botón
  updateButtonLoading(isLoading) {
    const button = document.getElementById('subscriptionButton');
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.innerHTML = `
        <span class="loading-spinner"></span>
        Procesando...
      `;
      button.classList.add('loading');
    } else {
      button.disabled = false;
      button.innerHTML = '💳 Suscribirse a Premium';
      button.classList.remove('loading');
    }
  }

  // Mostrar mensajes de error
  showError(message) {
    console.error('❌', message);
    this.showMessage(message, 'error');
  }

  // Mostrar mensajes de éxito
  showSuccess(message) {
    console.log('✅', message);
    this.showMessage(message, 'success');
  }

  // Sistema de mensajes unificado
  showMessage(message, type = 'info') {
    // Remover mensajes anteriores
    const existingMessage = document.querySelector('.subscription-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `subscription-message ${type}`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <span class="message-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
        <span class="message-text">${message}</span>
      </div>
    `;

    // Insertar en la página
    const form = document.querySelector('.subscription-form') || document.querySelector('.premium-section');
    if (form) {
      form.appendChild(messageDiv);
      
      // Auto-remover después de 5 segundos (excepto errores)
      if (type !== 'error') {
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 5000);
      }
    }

    // También usar notificaciones del navegador si están disponibles
    if (Notification.permission === 'granted') {
      new Notification('JuegoTEA', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  // Verificar estado de suscripción
  async checkSubscriptionStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/status`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error verificando estado de suscripción');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error verificando suscripción:', error);
      return { success: false, status: 'unknown' };
    }
  }

  // Inicializar eventos
  init() {
    console.log('🔄 Inicializando SubscriptionManager...');
    
    // Eventos del formulario
    const button = document.getElementById('subscriptionButton');
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.createSubscription();
      });
    }

    // Verificar estado inicial
    this.checkSubscriptionStatus().then(status => {
      console.log('📊 Estado de suscripción:', status);
    });

    console.log('✅ SubscriptionManager inicializado');
  }
}

// Estilos para los mensajes
const messageStyles = `
  .subscription-message {
    margin: 15px 0;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  }

  .subscription-message.error {
    background-color: #fee;
    border-color: #fcc;
    color: #c33;
  }

  .subscription-message.success {
    background-color: #efe;
    border-color: #cfc;
    color: #3c3;
  }

  .subscription-message.info {
    background-color: #eef;
    border-color: #ccf;
    color: #33c;
  }

  .message-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-radius: 50%;
    border-top: 2px solid #333;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .loading {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Inyectar estilos
if (!document.querySelector('#subscription-styles')) {
  const style = document.createElement('style');
  style.id = 'subscription-styles';
  style.textContent = messageStyles;
  document.head.appendChild(style);
}

// Crear instancia global
const subscriptionManager = new SubscriptionManager();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => subscriptionManager.init());
} else {
  subscriptionManager.init();
}