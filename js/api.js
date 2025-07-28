// js/api.js - Cliente para comunicarse con el backend - CORREGIDO

class APIClient {
  constructor() {
    // 🔧 URL CORREGIDA: SIN /api al final para evitar doble barra
    this.baseURL = 'https://api-juegostea.onrender.com';
    this.token = localStorage.getItem('authToken');
    
    // Detectar si estamos en desarrollo local
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '5500') {
      this.baseURL = 'http://localhost:3000';
      console.log('🔧 Modo desarrollo: usando API local');
    }
    
    console.log('🌐 API Base URL configurada:', this.baseURL);
  }

  // Configurar headers con autenticación
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para hacer requests con mejor manejo de errores
  async makeRequest(endpoint, options = {}) {
    try {
      // 🔧 CORREGIR: Construir URL correctamente sin dobles barras
      console.log(`🔗 Haciendo request a: ${this.baseURL}${endpoint}`);
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${this.baseURL}/api${cleanEndpoint}`;

      console.log(`🔗 URL completa: ${url}`);
      
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      console.log(`📤 API Request: ${config.method || 'GET'} ${url}`);
      if (config.body) {
        console.log('📋 Request body:', JSON.parse(config.body));
      }

      const response = await fetch(url, config);
      
      console.log(`📥 API Response: ${response.status} ${response.statusText}`);

      // Manejar diferentes tipos de contenido
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

      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Mejorar mensajes de error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else if (error.message.includes('CORS')) {
        throw new Error('Error de configuración del servidor. Intenta más tarde.');
      }
      
      throw error;
    }
  }

  // === AUTENTICACIÓN ===
  
  async verifyToken(firebaseToken) {
    const response = await this.makeRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token: firebaseToken })
    });

    if (response.success) {
      this.token = firebaseToken;
      localStorage.setItem('authToken', firebaseToken);
    }

    return response;
  }

  async getUserInfo() {
    return await this.makeRequest('/auth/user');
  }

  async logout() {
    const response = await this.makeRequest('/auth/logout', {
      method: 'POST'
    });

    this.token = null;
    localStorage.removeItem('authToken');
    
    return response;
  }

  // === SUSCRIPCIONES ===

  // 🔧 MÉTODO CORREGIDO: Ahora acepta userEmail y userName
  async createSubscription(userEmail, userName, plan = 'premium') {
    if (!userEmail || !userName) {
      throw new Error('Email y nombre de usuario son requeridos');
    }

    return await this.makeRequest('/subscription/create', {
      method: 'POST',
      body: JSON.stringify({ 
        plan: plan,
        userEmail: userEmail,
        userName: userName
      })
    });
  }

  // Método alternativo para mantener compatibilidad con el código existente
  async createSubscriptionLegacy(plan = 'premium') {
    return await this.makeRequest('/subscription/create', {
      method: 'POST',
      body: JSON.stringify({ plan })
    });
  }

  async checkSubscriptionStatus() {
    return await this.makeRequest('/subscription/status');
  }

  async cancelSubscription() {
    return await this.makeRequest('/subscription/cancel', {
      method: 'POST'
    });
  }

  // === JUEGOS ===

  async checkGameAccess(gameId) {
    return await this.makeRequest(`/games/${gameId}/access`);
  }

  async saveGameProgress(gameId, progressData) {
    return await this.makeRequest(`/games/${gameId}/progress`, {
      method: 'POST',
      body: JSON.stringify(progressData)
    });
  }

  async getGameProgress(gameId) {
    return await this.makeRequest(`/games/${gameId}/progress`);
  }

  async getUserDashboard() {
    return await this.makeRequest('/user/dashboard');
  }

  // === UTILIDADES ===

  // Verificar conectividad con el servidor
  async ping() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Ping failed:', error);
      return false;
    }
  }

  // Obtener información del servidor
  async getServerInfo() {
    try {
      const response = await fetch(`${this.baseURL}/`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo info del servidor:', error);
      return null;
    }
  }

  // Verificar si el usuario tiene conexión a la API
  async testConnection() {
    try {
      console.log('🔍 Probando conexión a la API...');
      
      const serverInfo = await this.getServerInfo();
      if (serverInfo) {
        console.log('✅ Conexión exitosa:', serverInfo);
        return { success: true, serverInfo };
      } else {
        console.warn('⚠️ Servidor no responde correctamente');
        return { success: false, error: 'Servidor no responde' };
      }
    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instancia global del cliente API
const apiClient = new APIClient();

// Función de utilidad para usar en subscription.js (mantener compatibilidad)
window.createSubscriptionRequest = async function(userEmail, userName, plan = 'premium') {
  try {
    return await apiClient.createSubscription(userEmail, userName, plan);
  } catch (error) {
    console.error('❌ Error en createSubscriptionRequest:', error);
    throw error;
  }
};

// Test inicial de conexión cuando se carga el script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    const connectionTest = await apiClient.testConnection();
    if (!connectionTest.success) {
      console.warn('⚠️ Problema de conectividad con la API:', connectionTest.error);
    }
  });
} else {
  // Si el DOM ya está cargado, ejecutar inmediatamente
  apiClient.testConnection().then(result => {
    if (!result.success) {
      console.warn('⚠️ Problema de conectividad con la API:', result.error);
    }
  });
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIClient;
}