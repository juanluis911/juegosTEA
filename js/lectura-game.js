// 📚 Juego de Lectura Interactiva - JuegoTEA
console.log('📚 Iniciando juego de lectura interactiva');

// Game State
const gameState = {
    currentLevel: 1,
    currentSentence: 0,
    score: 0,
    completedSentences: 0,
    totalSentencesPerLevel: 5,
    settings: {
        speechRate: 0.8,
        volume: 1.0,
        soundEnabled: true,
        textSize: 'normal',
        highContrast: false,
        autoRepeat: false,
        selectedVoice: null
    }
};

// Available Spanish voices (updated when page loads)
let availableSpanishVoices = [];

// Game Data - Structured by levels
const gameData = {
    1: {
        name: "Oraciones Simples",
        sentences: [
            {
                words: ["gato", "come", "pescado"],
                image: "🐱",
                definitions: {
                    "gato": "Animal doméstico que hace 'miau'",
                    "come": "Acción de alimentarse",
                    "pescado": "Animal que vive en el agua"
                }
            },
            {
                words: ["perro", "juega", "pelota"],
                image: "🐕",
                definitions: {
                    "perro": "Mascota fiel que ladra",
                    "juega": "Se divierte con algo",
                    "pelota": "Objeto redondo para jugar"
                }
            },
            {
                words: ["niña", "bebe", "agua"],
                image: "👧",
                definitions: {
                    "niña": "Persona pequeña de género femenino",
                    "bebe": "Toma líquidos",
                    "agua": "Líquido transparente que necesitamos"
                }
            },
            {
                words: ["pájaro", "vuela", "cielo"],
                image: "🐦",
                definitions: {
                    "pájaro": "Animal que tiene alas y plumas",
                    "vuela": "Se mueve por el aire",
                    "cielo": "Espacio azul sobre nosotros"
                }
            },
            {
                words: ["mamá", "cocina", "comida"],
                image: "👩‍🍳",
                definitions: {
                    "mamá": "La madre de la familia",
                    "cocina": "Prepara alimentos",
                    "comida": "Lo que comemos para alimentarnos"
                }
            }
        ]
    },
    2: {
        name: "Oraciones con Adjetivos",
        sentences: [
            {
                words: ["gato", "negro", "duerme", "cama"],
                image: "🐱",
                definitions: {
                    "gato": "Animal doméstico que hace 'miau'",
                    "negro": "Color oscuro como la noche",
                    "duerme": "Descansa con los ojos cerrados",
                    "cama": "Mueble para dormir"
                }
            },
            {
                words: ["niño", "pequeño", "lee", "libro"],
                image: "👦",
                definitions: {
                    "niño": "Persona pequeña de género masculino",
                    "pequeño": "De tamaño reducido",
                    "lee": "Mira palabras y las entiende",
                    "libro": "Objeto con páginas y palabras"
                }
            },
            {
                words: ["flor", "bonita", "crece", "jardín"],
                image: "🌸",
                definitions: {
                    "flor": "Parte colorida de las plantas",
                    "bonita": "Que se ve muy bien",
                    "crece": "Se hace más grande",
                    "jardín": "Lugar con plantas y flores"
                }
            },
            {
                words: ["coche", "rojo", "corre", "rápido"],
                image: "🚗",
                definitions: {
                    "coche": "Vehículo con cuatro ruedas",
                    "rojo": "Color como la sangre",
                    "corre": "Se mueve muy rápido",
                    "rápido": "Con mucha velocidad"
                }
            },
            {
                words: ["sol", "brillante", "calienta", "tierra"],
                image: "☀️",
                definitions: {
                    "sol": "Estrella que nos da luz",
                    "brillante": "Que da mucha luz",
                    "calienta": "Hace que algo esté tibio",
                    "tierra": "Planeta donde vivimos"
                }
            }
        ]
    },
    3: {
        name: "Oraciones Complejas",
        sentences: [
            {
                words: ["abuela", "amable", "prepara", "deliciosas", "galletas"],
                image: "👵",
                definitions: {
                    "abuela": "La mamá de tu papá o mamá",
                    "amable": "Que trata bien a los demás",
                    "prepara": "Hace algo con cuidado",
                    "deliciosas": "Que saben muy rico",
                    "galletas": "Dulces crujientes para comer"
                }
            },
            {
                words: ["hermano", "mayor", "enseña", "nuevos", "juegos"],
                image: "👦",
                definitions: {
                    "hermano": "Hijo de los mismos padres",
                    "mayor": "De más edad",
                    "enseña": "Explica cómo hacer algo",
                    "nuevos": "Que no conocíamos antes",
                    "juegos": "Actividades divertidas"
                }
            },
            {
                words: ["maestra", "paciente", "explica", "difíciles", "lecciones"],
                image: "👩‍🏫",
                definitions: {
                    "maestra": "Persona que enseña en la escuela",
                    "paciente": "Que espera sin enojarse",
                    "explica": "Hace que algo sea fácil de entender",
                    "difíciles": "Que cuesta trabajo hacer",
                    "lecciones": "Cosas que aprendemos"
                }
            },
            {
                words: ["doctor", "gentil", "examina", "pequeños", "pacientes"],
                image: "👨‍⚕️",
                definitions: {
                    "doctor": "Persona que cura a los enfermos",
                    "gentil": "Que es suave y cuidadoso",
                    "examina": "Revisa con atención",
                    "pequeños": "De tamaño chico",
                    "pacientes": "Personas que necesitan cuidado médico"
                }
            },
            {
                words: ["jardinero", "trabajador", "planta", "hermosas", "flores"],
                image: "👨‍🌾",
                definitions: {
                    "jardinero": "Persona que cuida plantas",
                    "trabajador": "Que hace su trabajo con esfuerzo",
                    "planta": "Pone semillas en la tierra",
                    "hermosas": "Muy bonitas de ver",
                    "flores": "Partes coloridas de las plantas"
                }
            }
        ]
    }
};

// Initialize voices when they become available
function initializeVoices() {
    const voices = speechSynthesis.getVoices();
    
    // Filter Spanish voices, prioritizing Latin American variants
    availableSpanishVoices = voices.filter(voice => {
        const lang = voice.lang.toLowerCase();
        return lang.includes('es') || lang.includes('spanish');
    }).sort((a, b) => {
        // Prioritize Latin American Spanish voices
        const latinCodes = ['es-mx', 'es-ar', 'es-co', 'es-pe', 'es-ve', 'es-cl', 'es-ec', 'es-uy'];
        const aIsLatin = latinCodes.some(code => a.lang.toLowerCase().includes(code));
        const bIsLatin = latinCodes.some(code => b.lang.toLowerCase().includes(code));
        
        if (aIsLatin && !bIsLatin) return -1;
        if (!aIsLatin && bIsLatin) return 1;
        
        return 0;
    });
    
    console.log('Voces españolas disponibles:', availableSpanishVoices.map(v => `${v.name} (${v.lang})`));
    
    // Update settings with best voice
    if (availableSpanishVoices.length > 0) {
        gameState.settings.selectedVoice = availableSpanishVoices[0];
        updateVoiceSelector();
    }
}

// Update voice selector in settings
function updateVoiceSelector() {
    const settingsPanel = document.getElementById('settingsPanel');
    
    // Check if voice selector already exists
    let voiceSelector = settingsPanel.querySelector('#voiceSelector');
    if (!voiceSelector) {
        // Create voice selector
        const voiceSetting = document.createElement('div');
        voiceSetting.className = 'setting-item';
        voiceSetting.innerHTML = `
            <label class="setting-label">Voz del Narrador</label>
            <select id="voiceSelector" class="setting-select" onchange="updateSelectedVoice()">
                <option value="">Voz por defecto</option>
            </select>
            <div style="font-size: 0.8rem; color: #718096; margin-top: 0.5rem;">
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="testVoice()">
                    🎤 Probar Voz
                </button>
            </div>
        `;
        
        // Insert after volume setting
        const volumeSetting = settingsPanel.querySelector('input[id="volume"]').closest('.setting-item');
        volumeSetting.parentNode.insertBefore(voiceSetting, volumeSetting.nextSibling);
        
        voiceSelector = document.getElementById('voiceSelector');
    }
    
    // Clear existing options
    voiceSelector.innerHTML = '<option value="">Voz por defecto del sistema</option>';
    
    // Add available Spanish voices
    availableSpanishVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        
        // Create descriptive name
        let displayName = voice.name;
        
        // Add country/region info based on language code
        const langMap = {
            'es-mx': '🇲🇽 México',
            'es-ar': '🇦🇷 Argentina', 
            'es-co': '🇨🇴 Colombia',
            'es-pe': '🇵🇪 Perú',
            'es-ve': '🇻🇪 Venezuela',
            'es-cl': '🇨🇱 Chile',
            'es-ec': '🇪🇨 Ecuador',
            'es-uy': '🇺🇾 Uruguay',
            'es-cr': '🇨🇷 Costa Rica',
            'es-pa': '🇵🇦 Panamá',
            'es-gt': '🇬🇹 Guatemala',
            'es-hn': '🇭🇳 Honduras',
            'es-ni': '🇳🇮 Nicaragua',
            'es-sv': '🇸🇻 El Salvador',
            'es-es': '🇪🇸 España',
            'es-us': '🇺🇸 EE.UU. (Español)'
        };
        
        const langCode = voice.lang.toLowerCase();
        const countryInfo = Object.keys(langMap).find(code => langCode.includes(code));
        
        if (countryInfo) {
            displayName = `${langMap[countryInfo]} - ${voice.name}`;
        } else if (langCode.includes('es')) {
            displayName = `🌎 ${voice.name} (${voice.lang})`;
        }
        
        option.textContent = displayName;
        
        // Mark as selected if it's the current voice
        if (gameState.settings.selectedVoice && gameState.settings.selectedVoice.name === voice.name) {
            option.selected = true;
        }
        
        voiceSelector.appendChild(option);
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    
    // Initialize voices first
    initializeVoices();
    
    // Voices may not be immediately available in some browsers
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {
            initializeVoices();
        };
    }
    
    setTimeout(() => {
        hideLoading();
        initializeGame();
        showWelcomeMessage();
    }, 1000);
});

// Initialize game
function initializeGame() {
    updateDisplay();
    loadSentence();
    setupEventListeners();
    loadSettings();
    console.log('📚 Juego de lectura inicializado');
}

// Setup event listeners
function setupEventListeners() {
    // Word click events
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('word')) {
            handleWordClick(e.target);
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                readSentence();
                break;
            case 'Enter':
                nextSentence();
                break;
            case 'ArrowRight':
                nextSentence();
                break;
            case 'Escape':
                toggleSettings();
                break;
        }
    });

    // Settings panel outside click
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('settingsPanel');
        const settingsBtn = e.target.closest('button[onclick="toggleSettings()"]');
        
        if (!panel.contains(e.target) && !settingsBtn && panel.classList.contains('open')) {
            toggleSettings();
        }
    });
}

// Load current sentence
function loadSentence() {
    const levelData = gameData[gameState.currentLevel];
    const sentence = levelData.sentences[gameState.currentSentence];
    
    if (!sentence) {
        completeLevelCheck();
        return;
    }

    const sentenceDisplay = document.getElementById('sentenceDisplay');
    const wordImage = document.getElementById('wordImage');
    
    // Clear previous content
    sentenceDisplay.innerHTML = '';
    
    // Create word elements
    sentence.words.forEach((word, index) => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        wordElement.textContent = word;
        wordElement.setAttribute('data-word', word);
        wordElement.setAttribute('data-definition', sentence.definitions[word]);
        wordElement.setAttribute('tabindex', '0');
        wordElement.setAttribute('role', 'button');
        wordElement.setAttribute('aria-label', `Palabra: ${word}. Haz clic para escuchar definición.`);
        
        sentenceDisplay.appendChild(wordElement);
    });

    // Update image
    wordImage.textContent = sentence.image;
    wordImage.classList.add('animate');
    setTimeout(() => wordImage.classList.remove('animate'), 500);

    // Auto-read if enabled
    if (gameState.settings.autoRepeat) {
        setTimeout(() => readSentence(), 1000);
    }
}

// Handle word click
function handleWordClick(wordElement) {
    const word = wordElement.getAttribute('data-word');
    const definition = wordElement.getAttribute('data-definition');
    
    // Visual feedback
    wordElement.classList.add('clicked');
    setTimeout(() => wordElement.classList.remove('clicked'), 500);
    
    // Show definition popup
    showDefinition(wordElement, definition);
    
    // Read word and definition
    speakText(`${word}. ${definition}`);
    
    // Play success sound
    playSound('click');
    
    // Update score
    updateScore(5);
    
    console.log(`Palabra seleccionada: ${word}`);
}

// Show definition popup
function showDefinition(wordElement, definition) {
    // Remove any existing popups
    document.querySelectorAll('.definition-popup').forEach(popup => popup.remove());
    
    const popup = document.createElement('div');
    popup.className = 'definition-popup';
    popup.textContent = definition;
    
    wordElement.style.position = 'relative';
    wordElement.appendChild(popup);
    
    // Show popup
    setTimeout(() => popup.classList.add('show'), 10);
    
    // Hide popup after 3 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// Read sentence aloud
function readSentence() {
    const words = Array.from(document.querySelectorAll('.word')).map(el => el.textContent);
    const sentence = words.join(' ');
    
    // Visual feedback
    highlightWords(words, false);
    
    speakText(sentence);
    playSound('read');
    
    console.log(`Leyendo: ${sentence}`);
}

// Read sentence slowly
function readSlowly() {
    const words = Array.from(document.querySelectorAll('.word'));
    
    readWordsSequentially(words, 0);
    playSound('slow');
}

// Read words one by one
function readWordsSequentially(words, index) {
    if (index >= words.length) return;
    
    const word = words[index];
    const text = word.textContent;
    
    // Highlight current word
    words.forEach(w => w.classList.remove('highlighted'));
    word.classList.add('highlighted');
    
    // Speak word
    speakTextWithCallback(text, () => {
        setTimeout(() => {
            word.classList.remove('highlighted');
            readWordsSequentially(words, index + 1);
        }, 500);
    });
}

// Highlight all words
function highlightWords(words, slow = false) {
    const wordElements = document.querySelectorAll('.word');
    
    wordElements.forEach((word, index) => {
        setTimeout(() => {
            word.classList.add('highlighted');
            setTimeout(() => word.classList.remove('highlighted'), slow ? 1000 : 500);
        }, index * (slow ? 800 : 200));
    });
}

// Next sentence
function nextSentence() {
    gameState.currentSentence++;
    gameState.completedSentences++;
    updateScore(20);
    
    const levelData = gameData[gameState.currentLevel];
    
    if (gameState.currentSentence >= levelData.sentences.length) {
        completeLevel();
    } else {
        updateDisplay();
        loadSentence();
        showFeedback('success', '¡Excelente!', 'Pasemos a la siguiente oración');
        playSound('success');
    }
}

// Complete current level
function completeLevel() {
    const levelComplete = document.getElementById('levelComplete');
    levelComplete.classList.add('show');
    
    updateScore(100); // Bonus for completing level
    playSound('levelComplete');
    
    // Celebrate!
    setTimeout(() => {
        showFeedback('success', '🎉 ¡Nivel Completado!', `Has terminado el Nivel ${gameState.currentLevel}`);
    }, 500);
    
    console.log(`Nivel ${gameState.currentLevel} completado`);
}

// Next level
function nextLevel() {
    if (gameData[gameState.currentLevel + 1]) {
        gameState.currentLevel++;
        gameState.currentSentence = 0;
        gameState.completedSentences = 0;
        
        document.getElementById('levelComplete').classList.remove('show');
        updateDisplay();
        loadSentence();
        
        showFeedback('success', '🚀 Nuevo Nivel', `Bienvenido al Nivel ${gameState.currentLevel}`);
        speakText(`Nivel ${gameState.currentLevel}. ${gameData[gameState.currentLevel].name}`);
    } else {
        // Game completed!
        showGameComplete();
    }
}

// Check if level is complete
function completeLevelCheck() {
    const levelData = gameData[gameState.currentLevel];
    if (gameState.currentSentence >= levelData.sentences.length) {
        completeLevel();
    }
}

// Show game complete message
function showGameComplete() {
    const container = document.querySelector('.game-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
            <h1 style="font-size: 3rem; color: #48bb78; margin-bottom: 2rem;">
                🏆 ¡Felicitaciones!
            </h1>
            <p style="font-size: 1.5rem; margin-bottom: 2rem; color: #2d3748;">
                Has completado todos los niveles de "Aprende a Leer"
            </p>
            <div style="background: linear-gradient(135deg, #48bb78, #68d391); color: white; 
                       padding: 2rem; border-radius: 20px; margin: 2rem 0;">
                <h2 style="margin-bottom: 1rem;">Tu Progreso Final:</h2>
                <p style="font-size: 1.2rem;">⭐ Puntos Totales: ${gameState.score}</p>
                <p style="font-size: 1.2rem;">📖 Oraciones Leídas: ${gameState.completedSentences}</p>
                <p style="font-size: 1.2rem;">🎯 Niveles Completados: ${gameState.currentLevel}</p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="restartGame()">
                    🔄 Jugar de Nuevo
                </button>
                <button class="btn btn-secondary" onclick="goBack()">
                    🏠 Volver al Menú
                </button>
            </div>
        </div>
    `;
    
    playSound('gameComplete');
    speakText('¡Felicitaciones! Has completado todos los niveles de Aprende a Leer.');
}

// Restart game
function restartGame() {
    gameState.currentLevel = 1;
    gameState.currentSentence = 0;
    gameState.score = 0;
    gameState.completedSentences = 0;
    
    // Reload page to reset everything
    location.reload();
}

// Update display elements
function updateDisplay() {
    const levelData = gameData[gameState.currentLevel];
    
    document.getElementById('levelDisplay').textContent = `Nivel ${gameState.currentLevel}`;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    
    const progress = (gameState.currentSentence / levelData.sentences.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    
    const progressText = `Progreso: ${gameState.currentSentence}/${levelData.sentences.length} oraciones completadas`;
    document.getElementById('progressText').textContent = progressText;
    
    // Update level description
    const levelInfo = document.querySelector('.level-info span:last-child');
    levelInfo.textContent = levelData.name;
}

// Update score
function updateScore(points) {
    gameState.score += points;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    
    // Animate score update
    const scoreElement = document.getElementById('scoreDisplay');
    scoreElement.style.transform = 'scale(1.2)';
    scoreElement.style.color = '#48bb78';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
        scoreElement.style.color = '#4299e1';
    }, 200);
}

// Show feedback message
function showFeedback(type, message, subtext = '') {
    const feedback = document.getElementById('feedback');
    const icon = document.getElementById('feedbackIcon');
    const messageEl = document.getElementById('feedbackMessage');
    const subtextEl = document.getElementById('feedbackSubtext');
    
    // Set content
    messageEl.textContent = message;
    subtextEl.textContent = subtext;
    
    // Set type
    feedback.className = `feedback ${type}`;
    
    if (type === 'success') {
        icon.textContent = '✅';
    } else if (type === 'error') {
        icon.textContent = '❌';
    }
    
    // Show feedback
    feedback.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}

// Enhanced speech synthesis with Latin voice preference
function speakText(text) {
    if (!gameState.settings.soundEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (gameState.settings.selectedVoice) {
        utterance.voice = gameState.settings.selectedVoice;
        utterance.lang = gameState.settings.selectedVoice.lang;
    } else {
        // Fallback to best available Spanish voice
        if (availableSpanishVoices.length > 0) {
            utterance.voice = availableSpanishVoices[0];
            utterance.lang = availableSpanishVoices[0].lang;
        } else {
            // Ultimate fallback
            utterance.lang = 'es-MX'; // Mexican Spanish as default
        }
    }
    
    utterance.rate = gameState.settings.speechRate;
    utterance.volume = gameState.settings.volume;
    utterance.pitch = 1.1;
    
    // Add some error handling
    utterance.onerror = function(event) {
        console.log('Error en síntesis de voz:', event.error);
        // Retry with system default if custom voice fails
        if (gameState.settings.selectedVoice) {
            const retryUtterance = new SpeechSynthesisUtterance(text);
            retryUtterance.lang = 'es-MX';
            retryUtterance.rate = gameState.settings.speechRate;
            retryUtterance.volume = gameState.settings.volume;
            retryUtterance.pitch = 1.1;
            speechSynthesis.speak(retryUtterance);
        }
    };
    
    speechSynthesis.speak(utterance);
}

// Speech synthesis with callback (enhanced)
function speakTextWithCallback(text, callback) {
    if (!gameState.settings.soundEnabled || !window.speechSynthesis) {
        callback();
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (gameState.settings.selectedVoice) {
        utterance.voice = gameState.settings.selectedVoice;
        utterance.lang = gameState.settings.selectedVoice.lang;
    } else {
        if (availableSpanishVoices.length > 0) {
            utterance.voice = availableSpanishVoices[0];
            utterance.lang = availableSpanishVoices[0].lang;
        } else {
            utterance.lang = 'es-MX';
        }
    }
    
    utterance.rate = gameState.settings.speechRate;
    utterance.volume = gameState.settings.volume;
    utterance.pitch = 1.1;
    
    utterance.onend = callback;
    utterance.onerror = function(event) {
        console.log('Error en síntesis de voz:', event.error);
        callback(); // Still call callback even on error
    };
    
    speechSynthesis.speak(utterance);
}

// Play sound effects
function playSound(type) {
    if (!gameState.settings.soundEnabled) return;
    
    // Create audio context for better browser support
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(gameState.settings.volume * 0.1, audioContext.currentTime);
        
        switch(type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'read':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
            case 'slow':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'levelComplete':
                // Play a victory tune
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
                        gain.gain.setValueAtTime(gameState.settings.volume * 0.1, audioContext.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                        osc.start();
                        osc.stop(audioContext.currentTime + 0.2);
                    }, i * 150);
                });
                return;
            case 'gameComplete':
                // Special celebration sound
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.setValueAtTime(1047, audioContext.currentTime);
                        gain.gain.setValueAtTime(gameState.settings.volume * 0.1, audioContext.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        osc.start();
                        osc.stop(audioContext.currentTime + 0.3);
                    }, i * 100);
                }
                return;
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Audio no disponible:', error);
    }
}

// Settings Functions
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('open');
}

function updateSpeechRate() {
    const rate = document.getElementById('speechRate').value;
    gameState.settings.speechRate = parseFloat(rate);
    document.getElementById('rateValue').textContent = rate;
    saveSettings();
}

function updateVolume() {
    const volume = document.getElementById('volume').value;
    gameState.settings.volume = parseFloat(volume);
    document.getElementById('volumeValue').textContent = Math.round(volume * 100);
    saveSettings();
}

function updateSelectedVoice() {
    const selector = document.getElementById('voiceSelector');
    const selectedIndex = selector.value;
    
    if (selectedIndex === '') {
        gameState.settings.selectedVoice = null;
    } else {
        gameState.settings.selectedVoice = availableSpanishVoices[parseInt(selectedIndex)];
    }
    
    saveSettings();
    
    // Provide feedback
    speakText('Esta es la nueva voz seleccionada. ¿Te gusta cómo suena?');
}

function testVoice() {
    const testPhrases = [
        'Hola, soy tu nueva voz para aprender a leer.',
        'El gato come pescado en la cocina.',
        'Me gusta leer cuentos divertidos.',
        'Vamos a aprender juntos de manera divertida.'
    ];
    
    const randomPhrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
    speakText(randomPhrase);
}

function toggleSound() {
    const toggle = document.getElementById('soundToggle');
    const label = toggle.nextElementSibling;
    
    gameState.settings.soundEnabled = !gameState.settings.soundEnabled;
    toggle.classList.toggle('active');
    label.textContent = gameState.settings.soundEnabled ? 'Activado' : 'Desactivado';
    saveSettings();
}

function toggleTextSize() {
    const toggle = document.getElementById('textSizeToggle');
    const label = toggle.nextElementSibling;
    
    gameState.settings.textSize = gameState.settings.textSize === 'normal' ? 'large' : 'normal';
    toggle.classList.toggle('active');
    label.textContent = gameState.settings.textSize === 'large' ? 'Grande' : 'Normal';
    
    // Apply text size
    document.body.classList.toggle('large-text', gameState.settings.textSize === 'large');
    saveSettings();
}

function toggleContrast() {
    const toggle = document.getElementById('contrastToggle');
    const label = toggle.nextElementSibling;
    
    gameState.settings.highContrast = !gameState.settings.highContrast;
    toggle.classList.toggle('active');
    label.textContent = gameState.settings.highContrast ? 'Alto' : 'Normal';
    
    // Apply contrast
    document.body.classList.toggle('high-contrast', gameState.settings.highContrast);
    saveSettings();
}

function toggleAutoRepeat() {
    const toggle = document.getElementById('autoRepeatToggle');
    const label = toggle.nextElementSibling;
    
    gameState.settings.autoRepeat = !gameState.settings.autoRepeat;
    toggle.classList.toggle('active');
    label.textContent = gameState.settings.autoRepeat ? 'Activado' : 'Desactivado';
    saveSettings();
}

// Save settings to localStorage (updated)
function saveSettings() {
    try {
        const settingsToSave = {
            ...gameState.settings,
            selectedVoice: gameState.settings.selectedVoice ? {
                name: gameState.settings.selectedVoice.name,
                lang: gameState.settings.selectedVoice.lang
            } : null
        };
        localStorage.setItem('juegoTeaReadingSettings', JSON.stringify(settingsToSave));
    } catch (error) {
        console.log('No se pudieron guardar las configuraciones');
    }
}

// Load settings from localStorage (updated)
function loadSettings() {
    try {
        const saved = localStorage.getItem('juegoTeaReadingSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            gameState.settings = { ...gameState.settings, ...settings };
            
            // Restore voice selection
            if (settings.selectedVoice) {
                const matchedVoice = availableSpanishVoices.find(voice => 
                    voice.name === settings.selectedVoice.name && 
                    voice.lang === settings.selectedVoice.lang
                );
                if (matchedVoice) {
                    gameState.settings.selectedVoice = matchedVoice;
                }
            }
            
            // Apply loaded settings
            document.getElementById('speechRate').value = gameState.settings.speechRate;
            document.getElementById('rateValue').textContent = gameState.settings.speechRate;
            document.getElementById('volume').value = gameState.settings.volume;
            document.getElementById('volumeValue').textContent = Math.round(gameState.settings.volume * 100);
            
            // Update toggles
            updateToggle('soundToggle', gameState.settings.soundEnabled, 'Activado', 'Desactivado');
            updateToggle('textSizeToggle', gameState.settings.textSize === 'large', 'Grande', 'Normal');
            updateToggle('contrastToggle', gameState.settings.highContrast, 'Alto', 'Normal');
            updateToggle('autoRepeatToggle', gameState.settings.autoRepeat, 'Activado', 'Desactivado');
            
            // Apply visual settings
            document.body.classList.toggle('large-text', gameState.settings.textSize === 'large');
            document.body.classList.toggle('high-contrast', gameState.settings.highContrast);
        }
    } catch (error) {
        console.log('No se pudieron cargar las configuraciones');
    }
}

// Update toggle state
function updateToggle(toggleId, isActive, activeText, inactiveText) {
    const toggle = document.getElementById(toggleId);
    const label = toggle.nextElementSibling;
    
    toggle.classList.toggle('active', isActive);
    label.textContent = isActive ? activeText : inactiveText;
}

// Navigation functions
function goBack() {
    if (confirm('¿Quieres volver al menú principal?\n\nTu progreso se guardará automáticamente.')) {
        saveProgress();
        // In a real app, this would navigate back
        window.history.back();
    }
}

// Save progress
function saveProgress() {
    try {
        const progress = {
            level: gameState.currentLevel,
            sentence: gameState.currentSentence,
            score: gameState.score,
            completed: gameState.completedSentences,
            date: new Date().toISOString()
        };
        localStorage.setItem('juegoTeaReadingProgress', JSON.stringify(progress));
        console.log('Progreso guardado:', progress);
    } catch (error) {
        console.log('No se pudo guardar el progreso');
    }
}

// Load progress
function loadProgress() {
    try {
        const saved = localStorage.getItem('juegoTeaReadingProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            
            if (confirm(`¿Quieres continuar desde donde lo dejaste?\n\nNivel: ${progress.level}\nPuntos: ${progress.score}`)) {
                gameState.currentLevel = progress.level;
                gameState.currentSentence = progress.sentence;
                gameState.score = progress.score;
                gameState.completedSentences = progress.completed;
                
                updateDisplay();
                loadSentence();
                
                showFeedback('success', '¡Bienvenido de vuelta!', 'Continuando desde tu último progreso');
            }
        }
    } catch (error) {
        console.log('No se pudo cargar el progreso');
    }
}

// Show welcome message
function showWelcomeMessage() {
    setTimeout(() => {
        showFeedback('success', '¡Bienvenido a Aprende a Leer!', 'Haz clic en las palabras para escuchar sus definiciones');
        speakText('¡Bienvenido a Aprende a Leer! Haz clic en las palabras para escuchar sus definiciones.');
    }, 500);
    
    // Check for saved progress
    setTimeout(() => {
        loadProgress();
    }, 2000);
}

// Loading functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Auto-save progress periodically
setInterval(saveProgress, 30000); // Save every 30 seconds

// Save progress on page unload
window.addEventListener('beforeunload', saveProgress);

// Add keyboard accessibility
document.addEventListener('keydown', function(e) {
    // Tab navigation for words
    if (e.key === 'Tab') {
        const words = document.querySelectorAll('.word');
        words.forEach(word => {
            word.addEventListener('focus', function() {
                this.style.outline = '3px solid #4299e1';
            });
            word.addEventListener('blur', function() {
                this.style.outline = 'none';
            });
        });
    }
    
    // Enter or space to activate focused word
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('word')) {
        e.preventDefault();
        handleWordClick(e.target);
    }
});

// Touch support for mobile
document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('word')) {
        e.target.style.transform = 'scale(0.95)';
    }
});

document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('word')) {
        e.target.style.transform = 'scale(1)';
    }
});

console.log('📚 Juego "Aprende a Leer" completamente cargado y listo');