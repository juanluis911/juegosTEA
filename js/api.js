// js/api.js - Cliente para comunicarse con el backend
class APIClient {
  constructor() {
    this.baseURL = 'https://api-juegotea.onrender.com/api';
    this.token = localStorage.getItem('authToken');
  }

  // Configurar headers con autenticación
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para hacer requests
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
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

  async createSubscription(plan = 'premium') {
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
}

// Instancia global del cliente API
const apiClient = new APIClient();