// 🏠 JavaScript específico para index.html
console.log('🏠 Index.js cargado correctamente');

// Variables globales
let selectedAge = 'preschool';
let selectedCategory = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Index inicializado');
    
    // Inicializar funcionalidades
    initializeCounters();
    initializeInteractions();
    initializeAccessibility();
    
    // Mensaje de bienvenida
    setTimeout(() => {
        showNotification('¡Bienvenido a JuegoTEA! 🎮');
    }, 1000);
});

// === FUNCIONES DE NAVEGACIÓN ===

/**
 * Navega a la página de Comunicación y Lenguaje
 */
function goToCommunication() {
    console.log('🎯 Navegando a Comunicación y Lenguaje');
    showLoading();
    //speakText("Entrando en Comunicación y Lenguaje");
    
    setTimeout(() => {
        hideLoading();
        // En producción, esto redirige a la página real
        window.location.href = './categorias/comunicacion-lenguaje.html';
    }, 1000);
}

/**
 * Selecciona una categoría de juegos
 * @param {string} category - Categoría seleccionada
 */
function selectCategory(category) {
    console.log('📂 Categoría seleccionada:', category);
    
    if (category === 'communication') {
        goToCommunication();
        return;
    }

    selectedCategory = category;
    showLoading();
    
    // Nombres de categorías
    const categoryNames = {
        social: "Habilidades Sociales",
        cognitive: "Habilidades Cognitivas", 
        sensory: "Integración Sensorial",
        motor: "Habilidades Motoras",
        emotional: "Regulación Emocional"
    };
    
    const categoryName = categoryNames[category];
    speakText(`Has seleccionado ${categoryName}`);
    
    setTimeout(() => {
        hideLoading();
        
        if (confirm(`¿Quieres acceder a "${categoryName}"?\n\nEsta sección estará disponible próximamente.\n¿Te gustaría ser notificado cuando esté lista?`)) {
            showNotification(`¡Te notificaremos cuando ${categoryName} esté disponible! 🔔`);
            
            setTimeout(() => {
                const email = prompt('Déjanos tu email para notificarte (opcional):');
                if (email && email.includes('@')) {
                    showNotification('¡Gracias! Te contactaremos pronto 📧');
                    // Aquí guardarías el email en localStorage o enviarías a un servidor
                    saveEmailForNotifications(email, category);
                }
            }, 1500);
        } else {
            showNotification('Puedes probar Comunicación y Lenguaje mientras tanto 💬');
        }
    }, 1500);
}

/**
 * Lanza un juego específico
 * @param {string} category - Categoría del juego
 * @param {string} age - Grupo de edad
 */
function launchGame(category, age) {
    console.log('🎮 Lanzando juego:', category, age);
    
    if (category === 'communication') {
        goToCommunication();
        return;
    }

    const categoryNames = {
        social: "Habilidades Sociales",
        cognitive: "Habilidades Cognitivas",
        sensory: "Integración Sensorial", 
        motor: "Habilidades Motoras",
        emotional: "Regulación Emocional"
    };

    const categoryName = categoryNames[category] || "Esta categoría";
    
    if (confirm(`${categoryName} estará disponible próximamente.\n\n¡Mientras tanto, puedes explorar Comunicación y Lenguaje que ya está completa!\n\n¿Quieres ir allí ahora?`)) {
        goToCommunication();
    } else {
        showNotification('¡Gracias por tu interés! Te mantendremos informado 📬');
    }
}

// === FUNCIONES DE EDAD ===

/**
 * Selecciona un grupo de edad
 * @param {string} age - Grupo de edad
 */
function selectAge(age) {
    console.log('👶 Edad seleccionada:', age);
    selectedAge = age;
    
    // Actualizar estado activo
    document.querySelectorAll('.age-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-age="${age}"]`).classList.add('active');
    
    // Actualizar juegos disponibles
    updateAvailableGames();
    
    // Feedback al usuario
    showNotification(`Edad seleccionada: ${getAgeLabel(age)}`);
}

/**
 * Obtiene la etiqueta de un grupo de edad
 * @param {string} age - Código de edad
 * @returns {string} Etiqueta descriptiva
 */
function getAgeLabel(age) {
    const labels = {
        early: "Primera Infancia (2-4 años)",
        preschool: "Preescolar (4-6 años)",
        school: "Escolar (6-12 años)",
        teen: "Adolescente (12-18 años)"
    };
    return labels[age] || labels.preschool;
}

/**
 * Actualiza los juegos disponibles según la edad
 */
function updateAvailableGames() {
    const cards = document.querySelectorAll('.category-card');
    
    // Añadir feedback visual
    cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    });
    
    // Animación sutil para indicar actualización
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// === FUNCIONES DE NAVEGACIÓN ===

/**
 * Scroll suave a la sección de categorías
 */
function scrollToCategories() {
    console.log('📜 Navegando a categorías');
    const element = document.getElementById('categorias');
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Toggle del menú móvil
 */
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    navMenu.classList.toggle('active');
    mobileBtn.classList.toggle('active');
    
    // ARIA
    const isExpanded = navMenu.classList.contains('active');
    mobileBtn.setAttribute('aria-expanded', isExpanded);
}

// === ANIMACIONES Y CONTADORES ===

/**
 * Inicializa los contadores animados
 */
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.7,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

/**
 * Anima un contador específico
 * @param {HTMLElement} element - Elemento contador
 * @param {number} target - Valor objetivo
 */
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const duration = 2000;
    const stepTime = duration / 100;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (target >= 1000) {
            element.textContent = Math.floor(current).toLocaleString();
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// === INTERACCIONES ===

/**
 * Inicializa las interacciones de la página
 */
function initializeInteractions() {
    console.log('🎯 Inicializando interacciones');
    
    // Efectos hover en tarjetas
    const cards = document.querySelectorAll('.category-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Navegación suave
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Cerrar menú móvil si está abierto
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Efecto parallax en hero
    window.addEventListener('scroll', throttle(function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const speed = scrolled * 0.5;
            hero.style.transform = `translateY(${speed}px)`;
        }
    }, 16)); // ~60fps
}

// === ACCESIBILIDAD ===

/**
 * Inicializa las mejoras de accesibilidad
 */
function initializeAccessibility() {
    console.log('♿ Inicializando accesibilidad');
    
    // Navegación por teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Configurar tarjetas de categorías
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Seleccionar categoría ${card.querySelector('.card-title').textContent}`);
        
        // Soporte de teclado
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Configurar tarjetas de edad
    const ageCards = document.querySelectorAll('.age-card');
    ageCards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Seleccionar edad ${card.querySelector('.age-title').textContent}`);
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Configurar botón de menú móvil
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.setAttribute('aria-label', 'Menú de navegación');
        mobileBtn.setAttribute('aria-expanded', 'false');
    }
}

// === UTILIDADES ===

/**
 * Función throttle para optimizar eventos de scroll
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite en ms
 * @returns {Function} Función throttled
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * Guarda email para notificaciones
 * @param {string} email - Email del usuario
 * @param {string} category - Categoría de interés
 */
function saveEmailForNotifications(email, category) {
    try {
        const notifications = JSON.parse(localStorage.getItem('juegoTEANotifications') || '[]');
        notifications.push({
            email: email,
            category: category,
            date: new Date().toISOString()
        });
        localStorage.setItem('juegoTEANotifications', JSON.stringify(notifications));
        console.log('📧 Email guardado para notificaciones');
    } catch (error) {
        console.error('❌ Error guardando email:', error);
    }
}

/**
 * Obtiene información de un juego
 * @param {string} category - Categoría
 * @param {string} age - Edad
 * @returns {Object} Información del juego
 */
function getGameInfo(category, age) {
    const games = {
        communication: {
            title: "Aprende a Leer",
            description: "Juego interactivo de lectura con palabras, colores y animales."
        },
        social: {
            title: "Reconoce Emociones",
            description: "Identifica expresiones faciales y aprende sobre diferentes emociones."
        },
        cognitive: {
            title: "Puzzles Inteligentes",
            description: "Rompecabezas adaptativos que desarrollan el pensamiento lógico."
        },
        sensory: {
            title: "Colores y Sonidos",
            description: "Experiencia sensorial controlada con estímulos visuales y auditivos."
        },
        motor: {
            title: "Coordinación Divertida",
            description: "Ejercicios de motricidad fina con seguimiento de movimientos."
        },
        emotional: {
            title: "Técnicas de Calma",
            description: "Aprende a manejar emociones con ejercicios de respiración y relajación."
        }
    };
    
    return games[category] || games.communication;
}

// === FUNCIONES DE LOADING ===

/**
 * Muestra el overlay de carga
 */
function showLoading() {
    let loadingOverlay = document.getElementById('loading');
    
    // Si no existe, crear el overlay de loading
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading';
        loadingOverlay.className = 'loading';
        loadingOverlay.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">Cargando...</div>
        `;
        
        // Añadir estilos si no existen
        if (!document.getElementById('loading-styles')) {
            const styles = document.createElement('style');
            styles.id = 'loading-styles';
            styles.textContent = `
                .loading {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(5px);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                
                .loading.show {
                    opacity: 1;
                    visibility: visible;
                }
                
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                
                .loading-text {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #2d3748;
                    text-align: center;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Animación adicional para el texto */
                .loading-text::after {
                    content: '';
                    animation: dots 1.5s steps(4, end) infinite;
                }
                
                @keyframes dots {
                    0%, 20% {
                        content: '';
                    }
                    40% {
                        content: '.';
                    }
                    60% {
                        content: '..';
                    }
                    80%, 100% {
                        content: '...';
                    }
                }
                
                /* Responsive */
                @media (max-width: 480px) {
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border-width: 4px;
                    }
                    
                    .loading-text {
                        font-size: 1rem;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(loadingOverlay);
    }
    
    // Mostrar el loading
    loadingOverlay.classList.add('show');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    console.log('🔄 Loading mostrado');
}

/**
 * Oculta el overlay de carga
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loading');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
        
        // Restaurar scroll del body después de la animación
        setTimeout(() => {
            document.body.style.overflow = '';
        }, 300);
    }
    
    console.log('✅ Loading ocultado');
}

/**
 * Muestra loading con mensaje personalizado
 * @param {string} message - Mensaje a mostrar durante la carga
 * @param {number} duration - Duración en ms (opcional, por defecto infinito)
 */
function showLoadingWithMessage(message = 'Cargando...', duration = 0) {
    showLoading();
    
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
    
    // Si se especifica duración, ocultar automáticamente
    if (duration > 0) {
        setTimeout(() => {
            hideLoading();
        }, duration);
    }
}

/**
 * Muestra loading con progreso (para futuras implementaciones)
 * @param {number} progress - Progreso de 0 a 100
 * @param {string} message - Mensaje opcional
 */
function showLoadingWithProgress(progress = 0, message = 'Cargando...') {
    showLoading();
    
    const loadingOverlay = document.getElementById('loading');
    const loadingText = loadingOverlay.querySelector('.loading-text');
    
    // Actualizar mensaje
    if (loadingText) {
        loadingText.innerHTML = `
            ${message}
            <div style="margin-top: 15px; width: 200px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${progress}%; height: 100%; background: linear-gradient(45deg, #667eea, #764ba2); transition: width 0.3s ease;"></div>
            </div>
            <div style="margin-top: 8px; font-size: 0.9rem; color: #718096;">${Math.round(progress)}%</div>
        `;
    }
}

// Exportar funciones si se usa módulos (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoading,
        hideLoading,
        showLoadingWithMessage,
        showLoadingWithProgress
    };
}
// === EVENTOS ESPECIALES ===

// Detectar cuando el usuario vuelve a la pestaña
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('👋 Usuario regresó a la pestaña');
        // Podrías mostrar una notificación de bienvenida de vuelta
    }
});

// Detectar errores de JavaScript
window.addEventListener('error', function(e) {
    console.error('❌ Error capturado:', e.error);
    // En producción, podrías enviar esto a un servicio de logging
});

// Detectar cambios de conectividad
window.addEventListener('online', function() {
    showNotification('¡Conexión restaurada! 🌐');
});

window.addEventListener('offline', function() {
    showNotification('Sin conexión - Modo offline activado 📱');
});

window.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('communicationCard');
    if (card) {
        card.addEventListener('click', goToCommunication);
    }
});

console.log('✅ Index.js inicializado completamente');