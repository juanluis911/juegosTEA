// 🧩 JuegoTEA - JavaScript principal
console.log('🧩 JuegoTEA cargado correctamente');

// Configuración global
const JuegoTEA = {
    version: '1.0.0',
    settings: {
        soundEnabled: true,
        speechRate: 0.8,
        theme: 'default'
    }
};
// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Iniciando JuegoTEA...');
    
    // Mostrar loading inicial
    showMainLoader(true);
    
    // Inicializar componentes
    await initializeApp();
    
    // Ocultar loading
    showMainLoader(false);
    
    console.log('✅ JuegoTEA iniciado correctamente');
    
  } catch (error) {
    console.error('❌ Error iniciando la aplicación:', error);
    showError('Error al cargar la aplicación. Por favor, recarga la página.');
  }
});
// Configuración global
const CONFIG = {
  API_URL: 'https://juegostea-api.onrender.com/api',
  ENVIRONMENT: 'production'
};

// Función de síntesis de voz
function speakText(text) {
    if (!JuegoTEA.settings.soundEnabled || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = JuegoTEA.settings.speechRate;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    console.log([] );
    // Implementar notificaciones visuales aquí
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ JuegoTEA inicializado');
    showNotification('¡Bienvenido a JuegoTEA! 🎮');
});

async function initializeApp() {
  // 1. Añadir elementos de UI necesarios
  addAuthUIElements();
  
  // 2. Inicializar sistema de autenticación
  if (typeof authManager !== 'undefined') {
    await authManager.init();
  }
  
  // 3. Inicializar control de acceso a juegos
  if (typeof gameAccessManager !== 'undefined') {
    gameAccessManager.init();
  }
  
  // 4. Configurar navigation
  setupNavigation();
  
  // 5. Cargar datos iniciales
  await loadInitialData();
  
  // 6. Configurar event listeners
  setupEventListeners();
}

function addAuthUIElements() {
  // Agregar sección de autenticación al header
  const header = document.querySelector('.header .nav-container');
  if (header && !document.getElementById('authSection')) {
    const authSection = document.createElement('div');
    authSection.id = 'authSection';
    authSection.className = 'auth-section';
    authSection.innerHTML = `
      <div id="subscriptionInfo" class="subscription-info"></div>
      <div id="userInfo" class="user-info" style="display: none;"></div>
      <button id="loginBtn" class="auth-btn login-btn" onclick="loginWithGoogle()">
        <img src="./assets/google-icon.svg" alt="Google" width="18">
        Iniciar Sesión
      </button>
      <button id="logoutBtn" class="auth-btn logout-btn" onclick="logout()" style="display: none;">
        Cerrar Sesión
      </button>
    `;
    header.appendChild(authSection);
  }

  // Agregar loaders si no existen
  if (!document.getElementById('authLoader')) {
    const authLoader = document.createElement('div');
    authLoader.id = 'authLoader';
    authLoader.className = 'auth-loader';
    authLoader.style.display = 'none';
    authLoader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(authLoader);
  }

  if (!document.getElementById('accessLoader')) {
    const accessLoader = document.createElement('div');
    accessLoader.id = 'accessLoader';
    accessLoader.className = 'access-loader';
    accessLoader.style.display = 'none';
    accessLoader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(accessLoader);
  }
}

async function loadInitialData() {
  try {
    // Cargar lista de juegos con información de acceso
    if (typeof apiClient !== 'undefined') {
      const response = await apiClient.makeRequest('/games/list', {
        method: 'GET'
      });
      
      if (response.success) {
        updateGameCardsWithAccessInfo(response.games);
      }
    }
  } catch (error) {
    console.error('Error cargando datos iniciales:', error);
  }
}

function updateGameCardsWithAccessInfo(games) {
  games.forEach(game => {
    const gameCard = document.querySelector(`[data-game-id="${game.id}"]`);
    if (gameCard) {
      // Agregar badge si no existe
      if (!gameCard.querySelector('.game-badge')) {
        const badge = document.createElement('div');
        badge.className = 'game-badge';
        gameCard.appendChild(badge);
      }

      const badge = gameCard.querySelector('.game-badge');
      
      if (game.type === 'free') {
        badge.textContent = 'GRATIS';
        gameCard.classList.add('free-game');
        gameCard.classList.remove('premium-game', 'locked');
      } else {
        if (game.hasAccess) {
          badge.textContent = 'PREMIUM';
          gameCard.classList.add('premium-game');
          gameCard.classList.remove('locked');
        } else {
          badge.textContent = '🔐 PREMIUM';
          gameCard.classList.add('premium-game', 'locked');
        }
      }
    }
  });
}

function setupEventListeners() {
  // Listener para botones de suscripción
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('subscribe-btn')) {
      e.preventDefault();
      if (typeof authManager !== 'undefined') {
        authManager.subscribe();
      }
    }
  });

  // Listener para cerrar modales con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.access-modal-overlay, .subscription-modal-overlay');
      modals.forEach(modal => modal.remove());
    }
  });

  // Listener para cerrar modales haciendo click fuera
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('access-modal-overlay') || 
        e.target.classList.contains('subscription-modal-overlay')) {
      e.target.remove();
    }
  });
}

function setupNavigation() {
  // Configurar smooth scrolling para navegación
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function showMainLoader(show) {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'global-error';
  errorDiv.innerHTML = `
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span class="error-message">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="error-close">×</button>
    </div>
  `;
  
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    if (document.body.contains(errorDiv)) {
      document.body.removeChild(errorDiv);
    }
  }, 8000);
}

// Función para scroll hacia categorías (botón CTA)
function scrollToCategories() {
  const categoriesSection = document.getElementById('categorias');
  if (categoriesSection) {
    categoriesSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Función para volver atrás (páginas de categorías)
function goBack() {
  if (document.referrer && document.referrer.includes(window.location.hostname)) {
    window.history.back();
  } else {
    window.location.href = './index.html';
  }
}

// Función para toggle del menú móvil
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  
  if (navMenu && mobileBtn) {
    navMenu.classList.toggle('active');
    mobileBtn.classList.toggle('active');
  }
}

// Funciones de selección de edad
function selectAge(ageGroup) {
  document.querySelectorAll('.age-card').forEach(card => {
    card.classList.remove('active');
  });
  
  document.querySelector(`[data-age="${ageGroup}"]`).classList.add('active');
  
  // Aquí podrías filtrar juegos por edad
  filterGamesByAge(ageGroup);
}

function filterGamesByAge(ageGroup) {
  // Implementar filtrado por edad si es necesario
  console.log(`Filtrando juegos para: ${ageGroup}`);
}

// Registro del Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
      })
      .catch(error => {
        console.log('❌ Error registrando Service Worker:', error);
      });
  });
}

// Prevenir comportamiento por defecto en cards de juegos
// (el control de acceso se maneja en gameAccessManager)
document.addEventListener('click', (e) => {
  const gameCard = e.target.closest('.game-card');
  if (gameCard) {
    e.preventDefault();
    // El gameAccessManager maneja el resto
  }
});

// Funciones globales para compatibilidad
window.scrollToCategories = scrollToCategories;
window.goBack = goBack;
window.toggleMobileMenu = toggleMobileMenu;
window.selectAge = selectAge;
