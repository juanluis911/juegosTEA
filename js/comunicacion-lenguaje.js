// 💬 Comunicación y Lenguaje - JavaScript completo
console.log('💬 Iniciando página de Comunicación y Lenguaje');

// Global variables
let currentAgeFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    filterByAge('all');
    addInteractivity();
    showWelcomeMessage();
});

// Age filtering
function filterByAge(age) {
    currentAgeFilter = age;
    
    // Update active filter button
    document.querySelectorAll('.age-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-age="${age}"]`).classList.add('active');
    
    // Filter game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        const cardAges = card.dataset.age;
        if (age === 'all' || cardAges.includes(age)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update visible games count
    const visibleGames = document.querySelectorAll('.game-card[style*="block"]').length || 
                        document.querySelectorAll('.game-card:not([style*="none"])').length;
    showNotification(`Mostrando ${visibleGames} juegos para ${getAgeLabel(age)}`);
}

// Get age label
function getAgeLabel(age) {
    const labels = {
        'all': 'todas las edades',
        'preschool': '4-6 años',
        'school': '6-12 años',
        'teen': '12+ años'
    };
    return labels[age] || labels.all;
}

// Launch game
function launchGame(gameType) {
    showLoading();
    
    // Game URLs mapping
    const gameUrls = {
        'reading': '../juegos/lectura-interactiva.html',
        'colors': '../juegos/colores-posiciones.html',
        'animals': '../juegos/animales-granja.html',
        'letters': '../juegos/letras-abecedario.html',
        'words': '../juegos/constructor-palabras.html',
        'stories': '../juegos/hora-cuento.html'
    };
    
    // Available games
    const availableGames = ['reading', 'colors', 'animals'];
    
    // Get game info
    const gameInfo = getGameInfo(gameType);
    
    // Simulate loading time
    setTimeout(() => {
        hideLoading();
        
        if (availableGames.includes(gameType) && gameUrls[gameType]) {
            // Available game - navigate to it
            showNotification(`Cargando ${gameInfo.title}...`);
            setTimeout(() => {
                window.location.href = gameUrls[gameType];
            }, 500);
        } else {
            // Coming soon game
            showComingSoonMessage(gameInfo);
        }
    }, 1000);
}

// Show coming soon message
function showComingSoonMessage(gameInfo) {
    if (confirm(`"${gameInfo.title}" estará disponible próximamente.\n\n${gameInfo.description}\n\n¿Te gustaría ser notificado cuando esté listo?`)) {
        showNotification(`¡Te notificaremos cuando ${gameInfo.title} esté disponible! 🔔`);
        
        // Simulate email subscription
        setTimeout(() => {
            const email = prompt('Déjanos tu email para notificarte (opcional):');
            if (email && email.includes('@')) {
                showNotification('¡Gracias! Te contactaremos pronto 📧');
                console.log('Email suscrito:', email);
                
                // Save subscription locally
                try {
                    const subscriptions = JSON.parse(localStorage.getItem('juegoTEASubscriptions') || '[]');
                    subscriptions.push({
                        email: email,
                        game: gameInfo.title,
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('juegoTEASubscriptions', JSON.stringify(subscriptions));
                } catch (error) {
                    console.log('Error guardando suscripción:', error);
                }
            }
        }, 1500);
    } else {
        showNotification('¡Prueba los juegos disponibles mientras tanto! 🎮');
    }
}

// Get game information
function getGameInfo(gameType) {
    const games = {
        'reading': {
            title: 'Aprende a Leer',
            description: 'Juego interactivo de lectura con historias progresivas y vocabulario visual.'
        },
        'colors': {
            title: 'Colores y Posiciones',
            description: 'Aprende colores básicos y conceptos espaciales de manera divertida.'
        },
        'animals': {
            title: 'Animales de la Granja',
            description: 'Identifica animales, aprende sus sonidos y clasifica por tamaños.'
        },
        'letters': {
            title: 'Aventura de las Letras',
            description: 'Aprende el abecedario con animaciones y actividades de trazado.'
        },
        'words': {
            title: 'Constructor de Palabras',
            description: 'Forma palabras arrastrando sílabas y mejora la ortografía.'
        },
        'stories': {
            title: 'Hora del Cuento',
            description: 'Crea y narra historias interactivas personalizadas.'
        }
    };
    
    return games[gameType] || { title: 'Juego', description: 'Juego educativo interactivo' };
}

// Go back to main page
function goBack() {
    if (confirm('¿Quieres volver a la página principal?')) {
        window.location.href = '../index.html';
    }
}

// Add interactivity
function addInteractivity() {
    // Add hover effects to game cards
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            
            // Announce game status for accessibility
            const gameType = this.dataset.game;
            if (gameType) {
                announceGameStatus(gameType);
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key >= '1' && e.key <= '6') {
            const gameIndex = parseInt(e.key) - 1;
            const gameCards = document.querySelectorAll('.game-card[data-game]');
            if (gameCards[gameIndex]) {
                const gameType = gameCards[gameIndex].dataset.game;
                launchGame(gameType);
            }
        }
        
        // Quick navigation shortcuts
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    launchGame('reading');
                    break;
                case '2':
                    e.preventDefault();
                    launchGame('colors');
                    break;
                case '3':
                    e.preventDefault();
                    launchGame('animals');
                    break;
                case 'h':
                    e.preventDefault();
                    goBack();
                    break;
            }
        }
        
        // Help
        if (e.key === 'F1') {
            e.preventDefault();
            showHelp();
        }
    });

    // Add voice synthesis for titles when clicked
    document.querySelectorAll('.game-title').forEach(title => {
        title.addEventListener('click', function(e) {
            e.stopPropagation();
            speakText(this.textContent);
        });
    });
    
    // Initialize tooltips for accessibility
    initializeAccessibility();
}

// Initialize accessibility features
function initializeAccessibility() {
    document.querySelectorAll('.game-card').forEach(card => {
        const title = card.querySelector('.game-title').textContent;
        const description = card.querySelector('.game-description').textContent;
        const isAvailable = card.classList.contains('available');
        const status = isAvailable ? 'disponible' : 'próximamente';
        
        card.setAttribute('title', `${title}: ${description}`);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${title}, ${status}. ${description}`);
        
        // Add keyboard support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const gameType = this.dataset.game;
                if (gameType) {
                    launchGame(gameType);
                }
            }
        });
    });
}

// Voice feedback for better accessibility
function announceGameStatus(gameType) {
    const gameInfo = getGameInfo(gameType);
    const availableGames = ['reading', 'colors', 'animals'];
    
    if (availableGames.includes(gameType)) {
        speakText(`${gameInfo.title} está disponible para jugar`);
    } else {
        speakText(`${gameInfo.title} estará disponible próximamente`);
    }
}

// Speech synthesis
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
    }
}

// Loading functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Notification system
function showNotification(message) {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(45deg, #4299e1, #63b3ed);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-weight: bold;
            max-width: 300px;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.transform = 'translateX(0)';

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 3000);
}

// Progress tracking
function trackProgress(gameType, score) {
    try {
        const progress = JSON.parse(localStorage.getItem('juegoTEAProgress') || '{}');
        if (!progress.communication) progress.communication = {};
        if (!progress.communication[gameType]) progress.communication[gameType] = [];
        
        progress.communication[gameType].push({
            score: score,
            date: new Date().toISOString(),
            duration: Math.floor(Math.random() * 600) + 300 // 5-15 minutes
        });
        
        localStorage.setItem('juegoTEAProgress', JSON.stringify(progress));
        console.log('Progreso guardado:', progress);
    } catch (error) {
        console.log('Error guardando progreso:', error);
    }
}

// Show welcome message
function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('¡Bienvenido a Comunicación y Lenguaje! 💬');
        speakText('Bienvenido a Comunicación y Lenguaje. Explora nuestros juegos interactivos.');
    }, 1000);
    
    // Check for returning users
    const lastVisit = localStorage.getItem('juegoTEACommunicationLastVisit');
    if (lastVisit) {
        const daysSince = Math.floor((Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
        if (daysSince > 0) {
            setTimeout(() => {
                showNotification(`¡Bienvenido de vuelta! ${daysSince} día${daysSince > 1 ? 's' : ''} desde tu última visita`);
            }, 3000);
        }
    }
    localStorage.setItem('juegoTEACommunicationLastVisit', Date.now().toString());
}

// Help system
function showHelp() {
    const helpContent = `
🎮 Comunicación y Lenguaje - Ayuda

⌨️ Atajos de teclado:
• 1-6: Seleccionar juego directamente
• Alt + 1-3: Ir a juegos disponibles
• Alt + H: Volver al inicio
• F1: Mostrar esta ayuda
• Tab: Navegar con teclado

🎯 Juegos disponibles:
• 📚 Aprende a Leer (Presiona 1)
• 🌈 Colores y Posiciones (Presiona 2)  
• 🐄 Animales de la Granja (Presiona 3)

♿ Accesibilidad:
• Síntesis de voz al pasar el mouse
• Navegación completa por teclado
• Descripciones detalladas
• Compatible con lectores de pantalla

🔄 Los juegos guardan tu progreso automáticamente
    `;
    
    alert(helpContent);
    speakText('Ayuda mostrada. Revisa los atajos de teclado disponibles.');
}

// Add help tooltip
function addHelpTooltip() {
    const helpTooltip = document.createElement('div');
    helpTooltip.id = 'helpTooltip';
    helpTooltip.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 0.8rem;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 250px;
    `;
    helpTooltip.textContent = 'Atajos: 1-3 para juegos, F1 para ayuda';
    document.body.appendChild(helpTooltip);

    // Show help on first visit
    setTimeout(() => {
        if (!localStorage.getItem('juegoTEACommunicationHelpShown')) {
            helpTooltip.style.opacity = '1';
            setTimeout(() => {
                helpTooltip.style.opacity = '0';
            }, 5000);
            localStorage.setItem('juegoTEACommunicationHelpShown', 'true');
        }
    }, 3000);

    return helpTooltip;
}

// Service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('../sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registrado exitosamente');
            })
            .catch(function(error) {
                console.log('ServiceWorker falló al registrarse:', error);
            });
    });
}

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('Error en la página:', e.error);
    showNotification('Ha ocurrido un error. Por favor, recarga la página.');
});

// Initialize help tooltip
addHelpTooltip();

// Log successful initialization
console.log('✅ Página de Comunicación y Lenguaje completamente cargada');
console.log('🎮 3 juegos disponibles: Lectura, Colores y Animales');
console.log('♿ Funciones de accesibilidad activadas');
console.log('⌨️ Atajos de teclado habilitados');