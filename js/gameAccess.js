// js/gameAccess.js - Sistema de control de acceso a juegos

class GameAccessManager {
  constructor() {
    this.freeGames = [
      'lectura-palabras',
      'colores-basicos', 
      'animales-sonidos'
    ];
    
    this.premiumGames = [
      'reconoce-emociones',
      'situaciones-sociales',
      'aventura-letras',
      'constructor-palabras',
      'hora-cuento',
      'puzzles-logicos',
      'memoria-secuencial',
      'patron-ritmos',
      'coordinacion-motora',
      'respiracion-relajacion',
      'identificar-sentimientos',
      'expresion-emocional',
      'integracion-sensorial'
    ];
  }

  // Verificar acceso antes de cargar un juego
  async checkAccessAndRedirect(gameId) {
    try {
      // Mostrar loader
      this.showAccessLoader(true);

      const response = await apiClient.checkGameAccess(gameId);
      
      if (response.hasAccess) {
        // Acceso permitido - cargar juego
        this.loadGame(gameId);
        return true;
      } else {
        // Acceso denegado - mostrar modal apropiado
        this.handleAccessDenied(response);
        return false;
      }

    } catch (error) {
      console.error('Error verificando acceso:', error);
      this.showError('Error al verificar acceso al juego');
      return false;
    } finally {
      this.showAccessLoader(false);
    }
  }

  handleAccessDenied(response) {
    const { reason, gameType } = response;

    switch (reason) {
      case 'authentication_required':
        this.showLoginRequiredModal();
        break;
      case 'subscription_required':
        this.showSubscriptionRequiredModal();
        break;
      default:
        this.showError('No tienes acceso a este juego');
    }
  }

  showLoginRequiredModal() {
    const modal = document.createElement('div');
    modal.className = 'access-modal-overlay';
    modal.innerHTML = `
      <div class="access-modal">
        <div class="modal-header">
          <h3>🔐 Inicia Sesión</h3>
          <button class="close-modal" onclick="this.closest('.access-modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>Para acceder a los juegos premium necesitas iniciar sesión con tu cuenta de Google.</p>
          <div class="modal-actions">
            <button class="btn-primary" onclick="authManager.signInWithGoogle()">
              <img src="./assets/google-icon.svg" alt="Google"> 
              Iniciar Sesión con Google
            </button>
            <button class="btn-secondary" onclick="this.closest('.access-modal-overlay').remove()">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  showSubscriptionRequiredModal() {
    const modal = document.createElement('div');
    modal.className = 'access-modal-overlay';
    modal.innerHTML = `
      <div class="access-modal">
        <div class="modal-header">
          <h3>🎮 Juego Premium</h3>
          <button class="close-modal" onclick="this.closest('.access-modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>Este juego está disponible solo para suscriptores premium.</p>
          
          <div class="premium-benefits">
            <h4>Con el Plan Premium obtienes:</h4>
            <ul>
              <li>✅ Acceso a todos los 16 juegos</li>
              <li>✅ Seguimiento detallado de progreso</li>
              <li>✅ Reportes personalizados para padres</li>
              <li>✅ Sin anuncios</li>
              <li>✅ Nuevos juegos cada mes</li>
            </ul>
          </div>

          <div class="pricing">
            <span class="price">$9.99/mes</span>
            <span class="price-note">Cancela cuando quieras</span>
          </div>

          <div class="modal-actions">
            <button class="btn-primary" onclick="authManager.subscribe()">
              💳 Suscribirse Ahora
            </button>
            <button class="btn-secondary" onclick="this.closest('.access-modal-overlay').remove()">
              Ver Juegos Gratuitos
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  loadGame(gameId) {
    // Redirigir al juego específico
    const gameUrls = {
      'lectura-palabras': './games/lectura-palabras.html',
      'colores-basicos': './games/colores-basicos.html',
      'animales-sonidos': './games/animales-sonidos.html',
      'reconoce-emociones': './games/reconoce-emociones.html',
      'situaciones-sociales': './games/situaciones-sociales.html'
      // Agregar más URLs según implementes los juegos
    };

    const gameUrl = gameUrls[gameId];
    if (gameUrl) {
      window.location.href = gameUrl;
    } else {
      this.showError('Juego no disponible aún - ¡Próximamente!');
    }
  }

  // Actualizar UI de las cards de juegos
  updateGameCards() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
      const gameId = card.dataset.gameId;
      
      if (this.freeGames.includes(gameId)) {
        // Juego gratuito
        card.classList.add('free-game');
        card.classList.remove('premium-game', 'locked');
        
        const badge = card.querySelector('.game-badge');
        if (badge) badge.textContent = 'GRATIS';
        
      } else if (this.premiumGames.includes(gameId)) {
        // Juego premium
        card.classList.add('premium-game');
        
        const hasAccess = authManager.currentUser && 
                         authManager.subscriptionStatus?.isActive;
        
        if (hasAccess) {
          card.classList.remove('locked');
          const badge = card.querySelector('.game-badge');
          if (badge) badge.textContent = 'PREMIUM';
        } else {
          card.classList.add('locked');
          const badge = card.querySelector('.game-badge');
          if (badge) badge.textContent = '🔐 PREMIUM';
        }
      }
    });
  }

  showAccessLoader(show) {
    const loader = document.getElementById('accessLoader');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'access-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 4000);
  }

  // Agregar listeners a las cards de juegos
  attachGameCardListeners() {
    document.addEventListener('click', (e) => {
      const gameCard = e.target.closest('.game-card');
      if (gameCard && !gameCard.classList.contains('disabled')) {
        const gameId = gameCard.dataset.gameId;
        if (gameId) {
          e.preventDefault();
          this.checkAccessAndRedirect(gameId);
        }
      }
    });
  }

  // Inicializar el manager
  init() {
    this.attachGameCardListeners();
    this.updateGameCards();
    
    // Actualizar cuando cambie el estado de autenticación
    if (typeof authManager !== 'undefined') {
      // Escuchar cambios en el estado de autenticación
      const originalUpdateUI = authManager.updateUI.bind(authManager);
      authManager.updateUI = () => {
        originalUpdateUI();
        this.updateGameCards();
      };
    }
  }
}

// Instancia global del manager de acceso
const gameAccessManager = new GameAccessManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  gameAccessManager.init();
});