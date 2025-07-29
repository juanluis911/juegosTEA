class SubscriptionManager {
  constructor() {
    this.loading = false;
    this.apiUrl = 'https://api-juegostea.onrender.com';
    this.init();
  }

  init() {
    console.log('🔧 Inicializando SubscriptionManager');
    console.log('🌐 API URL:', this.apiUrl);
    
    // Verificar conectividad de la API
    this.checkAPIHealth();
  }

  // Verificar salud de la API
  async checkAPIHealth() {
    try {
      console.log('🔍 Verificando salud de la API...');
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const healthData = await response.json();
        console.log('✅ API está funcionando:', healthData);
      } else {
        console.warn('⚠️ API respondió con error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error verificando API:', error);
    }
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Mostrar mensajes de error
  showError(message) {
    console.error('❌ Error:', message);
    
    // Crear o actualizar el elemento de error
    let errorDiv = document.getElementById('subscription-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'subscription-error';
      errorDiv.style.cssText = `
        background: #fed7d7;
        border: 1px solid #f56565;
        color: #c53030;
        padding: 12px;
        border-radius: 8px;
        margin: 10px 0;
        display: block;
        animation: slideIn 0.3s ease-out;
      `;
      
      // Insertar después del formulario o en el modal
      const form = document.querySelector('.subscription-form, .modal-content');
      if (form) {
        form.appendChild(errorDiv);
      }
    }
    
    errorDiv.innerHTML = `
      <strong>⚠️ Error:</strong> ${message}
      <button onclick="this.parentElement.style.display='none'" 
              style="float: right; background: none; border: none; color: #c53030; cursor: pointer;">✕</button>
    `;
    errorDiv.style.display = 'block';
    
    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
      if (errorDiv) errorDiv.style.display = 'none';
    }, 8000);
  }

  // Mostrar mensajes de éxito
  showSuccess(message) {
    console.log('✅ Éxito:', message);
    
    let successDiv = document.getElementById('subscription-success');
    if (!successDiv) {
      successDiv = document.createElement('div');
      successDiv.id = 'subscription-success';
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
      
      const form = document.querySelector('.subscription-form, .modal-content');
      if (form) {
        form.appendChild(successDiv);
      }
    }
    
    successDiv.innerHTML = `
      <strong>✅ Éxito:</strong> ${message}
    `;
    successDiv.style.display = 'block';
  }

  // Actualizar estado de botón de carga
  updateButtonLoading(loading) {
    const button = document.querySelector('.subscribe-btn, .btn-premium');
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

  // Método principal para crear suscripción
  async createSubscription() {
    if (this.loading) {
      console.warn('⚠️ Operación ya en progreso, ignorando...');
      return;
    }

    console.log('🚀 Iniciando proceso de suscripción...');

    // Obtener datos del formulario
    const userEmail = document.getElementById('userEmail')?.value?.trim();
    const userName = document.getElementById('userName')?.value?.trim();

    console.log('📋 Datos del formulario:', {
      userEmail: userEmail ? userEmail.substring(0, 3) + '***' : 'vacío',
      userName: userName ? userName.substring(0, 3) + '***' : 'vacío'
    });

    // Validaciones
    if (!userEmail || !userName) {
      this.showError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!this.isValidEmail(userEmail)) {
      this.showError('Por favor ingresa un email válido');
      return;
    }

    if (userName.length < 2) {
      this.showError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    try {
      this.loading = true;
      this.updateButtonLoading(true);

      // Limpiar mensajes anteriores
      const errorDiv = document.getElementById('subscription-error');
      const successDiv = document.getElementById('subscription-success');
      if (errorDiv) errorDiv.style.display = 'none';
      if (successDiv) successDiv.style.display = 'none';

      console.log('📤 Enviando request a la API...');
      
      // Construir URL correctamente (sin doble slash)
      const endpoint = `${this.apiUrl}/api/subscription/create`;
      console.log('🎯 Endpoint:', endpoint);

      const requestData = {
        plan: 'premium',
        userEmail: userEmail,
        userName: userName
      };

      console.log('📦 Datos de request:', {
        ...requestData,
        userEmail: userEmail.substring(0, 3) + '***'
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.error('❌ Error response body:', errorText);
          
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorData.message || errorMessage;
              
              if (errorData.details) {
                errorMessage += ` (${errorData.details})`;
              }
            } catch (parseError) {
              console.warn('⚠️ No se pudo parsear error como JSON:', parseError);
              errorMessage = errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '');
            }
          }
        } catch (textError) {
          console.error('❌ Error leyendo response text:', textError);
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('📥 Response body (raw):', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parsing JSON response:', parseError);
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('✅ Response data:', data);

      if (data.success && (data.init_point || data.sandbox_init_point)) {
        // Determinar URL de checkout
        const checkoutUrl = data.environment === 'sandbox' || data.environment === 'development' ? 
          data.sandbox_init_point : 
          data.init_point;

        if (!checkoutUrl) {
          throw new Error('No se recibió URL de checkout de MercadoPago');
        }

        console.log('🔗 URL de checkout:', checkoutUrl);
        
        // Guardar datos de la suscripción para posible reintento
        localStorage.setItem('pendingSubscription', JSON.stringify({
          userEmail,
          userName,
          plan: 'premium',
          timestamp: Date.now()
        }));
        
        this.showSuccess('¡Suscripción creada exitosamente! Redirigiendo al checkout...');
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          console.log('🚀 Redirigiendo a MercadoPago...');
          window.location.href = checkoutUrl;
        }, 2000);
        
      } else {
        throw new Error(data.message || data.error || 'No se pudo crear la preferencia de pago');
      }

    } catch (error) {
      console.error('❌ Error en createSubscription:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Mostrar error más específico al usuario
      let userMessage = 'Error al procesar la suscripción';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        userMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      } else if (error.message.includes('404')) {
        userMessage = 'Servicio temporalmente no disponible. Intenta en unos minutos.';
      } else if (error.message.includes('500')) {
        userMessage = 'Error interno del servidor. Nuestro equipo ha sido notificado.';
      } else if (error.message.length > 0) {
        userMessage = error.message;
      }
      
      this.showError(userMessage);
      
    } finally {
      this.loading = false;
      this.updateButtonLoading(false);
      console.log('🏁 Proceso de suscripción finalizado');
    }
  }

  // Método para verificar estado de suscripción
  async checkSubscriptionStatus() {
    try {
      console.log('🔍 Verificando estado de suscripción...');
      
      const response = await fetch(`${this.apiUrl}/api/subscription/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const statusData = await response.json();
        console.log('✅ Estado de suscripción:', statusData);
        return statusData;
      } else {
        console.warn('⚠️ Error verificando estado:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Error verificando estado de suscripción:', error);
      return null;
    }
  }

  // Método para reintentar suscripción
  async retrySubscription() {
    const pendingData = localStorage.getItem('pendingSubscription');
    
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        console.log('🔄 Reintentando suscripción con datos guardados...');
        
        // Rellenar formulario con datos guardados
        const emailField = document.getElementById('userEmail');
        const nameField = document.getElementById('userName');
        
        if (emailField) emailField.value = data.userEmail;
        if (nameField) nameField.value = data.userName;
        
        // Intentar crear suscripción nuevamente
        await this.createSubscription();
        
      } catch (error) {
        console.error('❌ Error reintentando suscripción:', error);
        this.showError('Error al reintentar. Por favor llena el formulario nuevamente.');
      }
    } else {
      console.warn('⚠️ No hay datos de suscripción para reintentar');
      this.showError('No hay datos de suscripción pendiente');
    }
  }
}

// === INICIALIZACIÓN GLOBAL ===
let subscriptionManager;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎮 DOM cargado, inicializando SubscriptionManager...');
  subscriptionManager = new SubscriptionManager();
  
  // Verificar si hay parámetros de retry en la URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('retry') === 'true') {
    console.log('🔄 Detectado parámetro de retry, intentando reanudar...');
    setTimeout(() => {
      if (subscriptionManager) {
        subscriptionManager.retrySubscription();
      }
    }, 1000);
  }
});

// Función global para botones onclick
function createSubscription() {
  console.log('🎯 createSubscription() llamada globalmente');
  if (subscriptionManager) {
    subscriptionManager.createSubscription();
  } else {
    console.error('❌ SubscriptionManager no está inicializado');
    alert('Error: Sistema no inicializado. Recarga la página.');
  }
}

// Función global para retry
function retrySubscription() {
  console.log('🔄 retrySubscription() llamada globalmente');
  if (subscriptionManager) {
    subscriptionManager.retrySubscription();
  } else {
    console.error('❌ SubscriptionManager no está inicializado');
  }
}

// Exportar para uso en módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubscriptionManager;
}