// === HERRAMIENTAS DE DEBUG PARA JUEGOTEA ===

class DebugTools {
  constructor() {
    this.isDebugMode = localStorage.getItem('debug') === 'true' || 
                      window.location.search.includes('debug=true');
    
    if (this.isDebugMode) {
      this.initDebugMode();
    }
  }

  initDebugMode() {
    console.log('🐛 Modo Debug activado');
    
    // Agregar estilos para debug
    this.injectDebugStyles();
    
    // Crear panel de debug
    this.createDebugPanel();
    
    // Interceptar errores
    this.interceptErrors();
    
    // Monitorear requests
    this.monitorRequests();
  }

  injectDebugStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .debug-panel {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 300px;
        max-height: 400px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        overflow-y: auto;
        border: 1px solid #333;
      }
      
      .debug-panel h3 {
        margin: 0 0 10px 0;
        color: #4CAF50;
      }
      
      .debug-log {
        margin-bottom: 5px;
        padding: 3px;
      }
      
      .debug-error {
        color: #f44336;
      }
      
      .debug-warning {
        color: #ff9800;
      }
      
      .debug-success {
        color: #4CAF50;
      }
      
      .debug-button {
        background: #2196F3;
        border: none;
        color: white;
        padding: 5px 10px;
        margin: 2px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      }
      
      .debug-button:hover {
        background: #1976D2;
      }
      
      .debug-toggle {
        position: fixed;
        top: 10px;
        right: 320px;
        background: #333;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10001;
        font-size: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  createDebugPanel() {
    // Crear toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'debug-toggle';
    toggleBtn.innerHTML = '🐛';
    toggleBtn.title = 'Toggle Debug Panel';
    
    // Crear panel
    this.debugPanel = document.createElement('div');
    this.debugPanel.className = 'debug-panel';
    this.debugPanel.style.display = 'block';
    
    this.debugPanel.innerHTML = `
      <h3>🐛 Debug Panel</h3>
      <div id="debug-logs"></div>
      <hr>
      <button class="debug-button" onclick="debugTools.testAPI()">Test API</button>
      <button class="debug-button" onclick="debugTools.clearLogs()">Clear</button>
      <button class="debug-button" onclick="debugTools.downloadLogs()">Download</button>
      <button class="debug-button" onclick="debugTools.testSubscription()">Test Sub</button>
      <hr>
      <div id="debug-stats"></div>
    `;
    
    // Toggle functionality
    let panelVisible = true;
    toggleBtn.addEventListener('click', () => {
      panelVisible = !panelVisible;
      this.debugPanel.style.display = panelVisible ? 'block' : 'none';
      toggleBtn.innerHTML = panelVisible ? '🐛' : '👁️';
    });
    
    document.body.appendChild(toggleBtn);
    document.body.appendChild(this.debugPanel);
    
    this.logsContainer = document.getElementById('debug-logs');
    this.statsContainer = document.getElementById('debug-stats');
    
    this.updateStats();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `debug-log debug-${type}`;
    
    let emoji = '📝';
    switch(type) {
      case 'error': emoji = '❌'; break;
      case 'warning': emoji = '⚠️'; break;
      case 'success': emoji = '✅'; break;
      case 'request': emoji = '📤'; break;
      case 'response': emoji = '📥'; break;
    }
    
    logEntry.innerHTML = `[${timestamp}] ${emoji} ${message}`;
    
    if (this.logsContainer) {
      this.logsContainer.appendChild(logEntry);
      this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
      
      // Limitar a 50 logs
      if (this.logsContainer.children.length > 50) {
        this.logsContainer.removeChild(this.logsContainer.firstChild);
      }
    }
    
    // También log en consola
    console.log(`[DEBUG] ${message}`);
  }

  interceptErrors() {
    // Interceptar errores de JavaScript
    const originalError = console.error;
    console.error = (...args) => {
      this.log(`JS Error: ${args.join(' ')}`, 'error');
      originalError.apply(console, args);
    };
    
    // Interceptar errores globales
    window.addEventListener('error', (event) => {
      this.log(`Global Error: ${event.error?.message || event.message}`, 'error');
    });
    
    // Interceptar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.log(`Unhandled Promise: ${event.reason}`, 'error');
    });
  }

  monitorRequests() {
    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || 'GET';
      
      this.log(`${method} ${url}`, 'request');
      
      try {
        const response = await originalFetch(...args);
        this.log(`Response: ${response.status} ${response.statusText}`, 
                 response.ok ? 'success' : 'error');
        return response;
      } catch (error) {
        this.log(`Fetch Error: ${error.message}`, 'error');
        throw error;
      }
    };
  }

  updateStats() {
    if (!this.statsContainer) return;
    
    const stats = {
      'User Agent': navigator.userAgent.substring(0, 50) + '...',
      'URL': window.location.href,
      'Local Storage': Object.keys(localStorage).length + ' items',
      'Session Storage': Object.keys(sessionStorage).length + ' items',
      'API Base': subscriptionManager?.apiUrl || 'No definida',
      'Subscription Manager': !!subscriptionManager ? 'Inicializado' : 'No inicializado'
    };
    
    this.statsContainer.innerHTML = Object.entries(stats)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join('<br>');
  }

  clearLogs() {
    if (this.logsContainer) {
      this.logsContainer.innerHTML = '';
    }
    this.log('Logs cleared', 'success');
  }

  downloadLogs() {
    const logs = Array.from(this.logsContainer?.children || [])
      .map(el => el.textContent)
      .join('\n');
    
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `juegotea-debug-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.log('Debug logs downloaded', 'success');
  }

  async testAPI() {
    this.log('Testing API connectivity...', 'info');
    
    try {
      const apiUrl = subscriptionManager?.apiUrl || 'https://api-juegostea.onrender.com';
      
      // Test health endpoint
      this.log(`Testing ${apiUrl}/health`, 'request');
      const healthResponse = await fetch(`${apiUrl}/health`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        this.log(`Health OK: ${JSON.stringify(healthData, null, 2)}`, 'success');
      } else {
        this.log(`Health Failed: ${healthResponse.status}`, 'error');
      }
      
      // Test root endpoint
      this.log(`Testing ${apiUrl}/`, 'request');
      const rootResponse = await fetch(`${apiUrl}/`);
      
      if (rootResponse.ok) {
        const rootData = await rootResponse.json();
        this.log(`Root OK: ${rootData.message}`, 'success');
      } else {
        this.log(`Root Failed: ${rootResponse.status}`, 'error');
      }
      
    } catch (error) {
      this.log(`API Test Error: ${error.message}`, 'error');
    }
  }

  async testSubscription() {
    this.log('Testing subscription endpoint...', 'info');
    
    try {
      const apiUrl = subscriptionManager?.apiUrl || 'https://api-juegostea.onrender.com';
      const endpoint = `${apiUrl}/api/subscription/create`;
      
      // Test data
      const testData = {
        plan: 'premium',
        userEmail: 'test@example.com',
        userName: 'Test User'
      };
      
      this.log(`POST ${endpoint}`, 'request');
      this.log(`Data: ${JSON.stringify(testData)}`, 'info');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      const responseText = await response.text();
      this.log(`Response Status: ${response.status}`, response.ok ? 'success' : 'error');
      this.log(`Response Body: ${responseText}`, 'info');
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          this.log(`Parsed Response: ${JSON.stringify(data, null, 2)}`, 'success');
        } catch (e) {
          this.log(`JSON Parse Error: ${e.message}`, 'error');
        }
      }
      
    } catch (error) {
      this.log(`Subscription Test Error: ${error.message}`, 'error');
    }
  }

  // Método para activar/desactivar debug desde consola
  static toggle() {
    const current = localStorage.getItem('debug') === 'true';
    localStorage.setItem('debug', (!current).toString());
    location.reload();
  }

  // Método para ver logs en consola
  static showLogs() {
    const logs = Array.from(document.querySelectorAll('.debug-log'))
      .map(el => el.textContent);
    console.table(logs);
  }
}

// === INICIALIZACIÓN AUTOMÁTICA ===
let debugTools;

// Inicializar herramientas de debug
document.addEventListener('DOMContentLoaded', function() {
  debugTools = new DebugTools();
  
  // Agregar funciones globales para consola
  window.debugToggle = DebugTools.toggle;
  window.debugLogs = DebugTools.showLogs;
  
  if (debugTools.isDebugMode) {
    console.log(`
    🐛 MODO DEBUG ACTIVADO
    
    Funciones disponibles:
    - debugToggle()     : Activar/desactivar debug
    - debugLogs()       : Mostrar logs en consola
    - debugTools.testAPI()  : Probar conectividad API
    - debugTools.testSubscription() : Probar endpoint suscripción
    
    Para desactivar: localStorage.setItem('debug', 'false') y recarga
    `);
  }
});

// === INSTRUCCIONES DE USO ===
/*
CÓMO USAR LAS HERRAMIENTAS DE DEBUG:

1. Activar debug mode:
   - Agregar ?debug=true a la URL, o
   - En consola: localStorage.setItem('debug', 'true') y recargar

2. Panel de debug:
   - Aparece en la esquina superior derecha
   - Muestra logs en tiempo real
   - Botones para probar API y descargar logs

3. Funciones de consola:
   - debugToggle() : Activar/desactivar
   - debugLogs() : Ver todos los logs
   - debugTools.testAPI() : Probar endpoints

4. Logs automáticos:
   - Todos los fetch requests
   - Errores de JavaScript
   - Respuestas de la API
   - Estados de la aplicación

5. Desactivar:
   - Click en el botón 🐛 para ocultar panel
   - localStorage.setItem('debug', 'false') para desactivar completamente
*/

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebugTools;
}