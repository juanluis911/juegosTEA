// js/subscription.js - Integrado con APIClient corregido

class SubscriptionManager {
  constructor() {
    // Usar el APIClient en lugar de URLs directas
    this.apiClient = window.apiClient || new APIClient();
    this.loading = false;
    
    console.log('🌐 SubscriptionManager usando APIClient');
  }

  // Crear suscripción usando APIClient
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

      console.log('📤 Creando suscripción para:', { userEmail, userName });

      // Usar el APIClient en lugar de fetch directo
      const response = await this.apiClient.createSubscription(userEmail, userName, 'premium');

      console.log('✅ Subscription response:', response);

      if (response.success && (response.init_point || response.sandbox_init_point)) {
        // Determinar qué URL usar según el ambiente
        const checkoutUrl = response.environment === 'sandbox' ? 
          response.sandbox_init_point : 
          response.init_point;

        console.log('🔗 Redirigiendo a checkout:', checkoutUrl);
        
        // Mostrar mensaje de éxito
        this.showSuccess('¡Suscripción creada! Redirigiendo al checkout...');
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1500);
        
      } else {
        throw new Error(response.message || 'No se pudo crear la preferencia de pago');
      }

    } catch (error) {
      console.error('❌ Error creando suscripción:', error);
      this.showError(error.message || 'Error al procesar la suscripción');
    } finally {
      this.loading = false;
      this.updateButtonLoading(false);
    }
  }

  // Método alternativo usando fetch directo (fallback)
  async createSubscriptionFallback() {
    if (this.loading) return;

    const userEmail = document.getElementById('userEmail')?.value.trim();
    const userName = document.getElementById('userName')?.value.trim();

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

      // URL directa como fallback
      const apiUrl = 'https://api-juegostea.onrender.com';
      const endpoint = `${apiUrl}/api/subscription/create`;
      
      console.log('📤 Fallback: Enviando request a:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          plan: 'premium',
          userEmail: userEmail,
          userName: userName
        })
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Fallback response:', data);

      if (data.success && (data.init_point || data.sandbox_init_point)) {
        const checkoutUrl = data.environment === 'sandbox' ? 
          data.sandbox_init_point : 
          data.init_point;

        this.showSuccess('¡Suscripción creada! Redirigiendo al checkout...');
        
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1500);
      } else {
        throw new Error(data.message || 'No se pudo crear la preferencia de pago');
      }

    } catch (error) {
      console.error('❌ Error en fallback:', error);
      this.showError(error.message || 'Error al procesar la suscripción');
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
    const form = document.querySelector('.subscription-form') || 
                 document.querySelector('.premium-section') ||
                 document.querySelector('main');
                 
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

    // También mostrar en consola
    const logMethod = type === 'error' ? console.error : console.log;
    logMethod(`${type.toUpperCase()}: ${message}`);
  }

  // Verificar estado de suscripción usando APIClient
  async checkSubscriptionStatus() {
    try {
      const response = await this.apiClient.checkSubscriptionStatus();
      return response;
    } catch (error) {
      console.error('❌ Error verificando suscripción:', error);
      return { success: false, status: 'unknown' };
    }
  }

  // Test de conectividad
  async testConnection() {
    try {
      console.log('🔍 Probando conexión con la API...');
      
      if (this.apiClient && typeof this.apiClient.testConnection === 'function') {
        const result = await this.apiClient.testConnection();
        console.log('🔗 Resultado del test:', result);
        return result;
      } else {
        console.warn('⚠️ APIClient no disponible, usando fallback');
        return { success: false, error: 'APIClient no disponible' };
      }
    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return { success: false, error: error.message };
    }
  }

  // Inicializar eventos y funcionalidad
  async init() {
    console.log('🔄 Inicializando SubscriptionManager...');
    
    // Test de conectividad inicial
    const connectionTest = await this.testConnection();
    if (!connectionTest.success) {
      console.warn('⚠️ Problema de conectividad:', connectionTest.error);
      this.showMessage('Problema de conexión detectado. Usando modo fallback.', 'info');
    }

    // Eventos del formulario
    const button = document.getElementById('subscriptionButton');
    if (button) {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Intentar con APIClient primero, luego fallback
        try {
          await this.createSubscription();
        } catch (error) {
          console.warn('⚠️ Error con APIClient, intentando fallback...');
          await this.createSubscriptionFallback();
        }
      });
    } else {
      console.warn('⚠️ Botón de suscripción no encontrado');
    }

    // Verificar estado inicial de suscripción
    this.checkSubscriptionStatus().then(status => {
      console.log('📊 Estado de suscripción inicial:', status);
    });

    console.log('✅ SubscriptionManager inicializado');
  }
}

// Estilos para los mensajes (mejorados)
const messageStyles = `
  .subscription-message {
    margin: 15px 0;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
    position: relative;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
    pointer-events: none;
  }

  #subscriptionButton {
    transition: all 0.3s ease;
  }

  #subscriptionButton:hover:not(.loading) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

// Inyectar estilos mejorados
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

// Exportar para uso en otros módulos
if (typeof window !== 'undefined') {
  window.subscriptionManager = subscriptionManager;
}