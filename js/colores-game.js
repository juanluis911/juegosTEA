// 🌈 Juego de Colores y Posiciones - JuegoTEA
console.log('🌈 Iniciando juego de colores y posiciones');

// Game State
const gameState = {
    currentLevel: 1,
    currentChallenge: 0,
    score: 0,
    completedChallenges: 0,
    totalChallengesPerLevel: 5,
    settings: {
        soundEnabled: true,
        speechRate: 0.8,
        volume: 1.0
    }
};

// Colors data
const colors = {
    rojo: { hex: '#e53e3e', emoji: '🔴', name: 'rojo' },
    azul: { hex: '#3182ce', emoji: '🔵', name: 'azul' },
    verde: { hex: '#38a169', emoji: '🟢', name: 'verde' },
    amarillo: { hex: '#d69e2e', emoji: '🟡', name: 'amarillo' },
    naranja: { hex: '#dd6b20', emoji: '🟠', name: 'naranja' },
    morado: { hex: '#805ad5', emoji: '🟣', name: 'morado' },
    rosa: { hex: '#d53f8c', emoji: '🌸', name: 'rosa' },
    negro: { hex: '#2d3748', emoji: '⚫', name: 'negro' },
    blanco: { hex: '#f7fafc', emoji: '⚪', name: 'blanco' },
    marrón: { hex: '#8b4513', emoji: '🟤', name: 'marrón' }
};

// Positions data
const positions = {
    dentro: { name: 'dentro', description: 'en el interior de la caja' },
    fuera: { name: 'fuera', description: 'fuera de la caja' },
    cerca: { name: 'cerca', description: 'próximo a la caja' },
    lejos: { name: 'lejos', description: 'alejado de la caja' },
    arriba: { name: 'arriba', description: 'encima de la caja' },
    abajo: { name: 'abajo', description: 'debajo de la caja' }
};

// Game Data - Structured by levels
const gameData = {
    1: {
        name: "Colores Básicos",
        colors: ['rojo', 'azul', 'verde', 'amarillo'],
        positions: ['dentro', 'fuera'],
        challenges: [
            { color: 'rojo', position: 'dentro', object: '🟥' },
            { color: 'azul', position: 'fuera', object: '🟦' },
            { color: 'verde', position: 'dentro', object: '🟩' },
            { color: 'amarillo', position: 'fuera', object: '🟨' },
            { color: 'rojo', position: 'dentro', object: '❤️' }
        ]
    },
    2: {
        name: "Más Colores y Posiciones",
        colors: ['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado'],
        positions: ['dentro', 'fuera', 'cerca', 'lejos'],
        challenges: [
            { color: 'naranja', position: 'cerca', object: '🧡' },
            { color: 'morado', position: 'lejos', object: '💜' },
            { color: 'verde', position: 'dentro', object: '🍀' },
            { color: 'azul', position: 'fuera', object: '💙' },
            { color: 'amarillo', position: 'cerca', object: '⭐' }
        ]
    },
    3: {
        name: "Todos los Colores",
        colors: ['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado', 'rosa', 'negro'],
        positions: ['dentro', 'fuera', 'cerca', 'lejos'],
        challenges: [
            { color: 'rosa', position: 'dentro', object: '🌸' },
            { color: 'negro', position: 'fuera', object: '⚫' },
            { color: 'morado', position: 'cerca', object: '🍇' },
            { color: 'naranja', position: 'lejos', object: '🍊' },
            { color: 'verde', position: 'dentro', object: '🐸' }
        ]
    }
};

// Drag and drop state
let dragState = {
    isDragging: false,
    draggedElement: null,
    currentDropZone: null
};

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        initializeGame();
        showWelcomeMessage();
    }, 1000);
});

// Initialize game
function initializeGame() {
    setupDragAndDrop();
    updateDisplay();
    loadChallenge();
    console.log('🌈 Juego de colores inicializado');
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    // Add global event listeners
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    
    // Touch events for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// Load current challenge
function loadChallenge() {
    const levelData = gameData[gameState.currentLevel];
    const challenge = levelData.challenges[gameState.currentChallenge];
    
    if (!challenge) {
        completeLevelCheck();
        return;
    }

    // Update instruction
    const instruction = `Arrastra el objeto ${challenge.color.toUpperCase()} ${challenge.position.toUpperCase()} de la caja`;
    document.getElementById('instructionText').textContent = instruction;
    
    // Create color palette
    createColorPalette(levelData.colors);
    
    // Create play area
    createPlayArea(levelData.positions, challenge);
    
    // Speak instruction
    setTimeout(() => {
        speakText(instruction);
    }, 500);
}

// Create color palette
function createColorPalette(levelColors) {
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';
    
    levelColors.forEach(colorName => {
        const color = colors[colorName];
        const colorElement = document.createElement('div');
        colorElement.className = 'color-option';
        colorElement.style.backgroundColor = color.hex;
        colorElement.textContent = color.name;
        colorElement.setAttribute('data-color', colorName);
        
        // Add click handler
        colorElement.addEventListener('click', () => selectColor(colorName));
        
        palette.appendChild(colorElement);
    });
}

// Create play area
function createPlayArea(levelPositions, challenge) {
    const playArea = document.getElementById('playArea');
    playArea.innerHTML = '';
    
    // Create containers based on positions
    levelPositions.forEach(position => {
        const container = document.createElement('div');
        container.className = `container-box container-${position}`;
        container.textContent = position.toUpperCase();
        container.setAttribute('data-position', position);
        container.setAttribute('data-accepts-drops', 'true');
        
        playArea.appendChild(container);
    });
    
    // Create draggable object
    const object = document.createElement('div');
    object.className = 'draggable-object';
    object.style.backgroundColor = colors[challenge.color].hex;
    object.textContent = challenge.object;
    object.setAttribute('draggable', 'true');
    object.setAttribute('data-color', challenge.color);
    object.setAttribute('data-object', challenge.object);
    
    // Position object randomly but not in target zone
    positionObjectRandomly(object, challenge.position);
    
    playArea.appendChild(object);
}

// Position object randomly
function positionObjectRandomly(object, targetPosition) {
    const playArea = document.getElementById('playArea');
    const rect = playArea.getBoundingClientRect();
    
    let x, y;
    
    // Avoid placing in target zone initially
    do {
        x = Math.random() * (playArea.clientWidth - 80);
        y = Math.random() * (playArea.clientHeight - 80);
    } while (isInTargetZone(x, y, targetPosition));
    
    object.style.left = x + 'px';
    object.style.top = y + 'px';
}

// Check if position is in target zone
function isInTargetZone(x, y, targetPosition) {
    const container = document.querySelector(`[data-position="${targetPosition}"]`);
    if (!container) return false;
    
    const rect = container.getBoundingClientRect();
    const playRect = document.getElementById('playArea').getBoundingClientRect();
    
    const containerX = rect.left - playRect.left;
    const containerY = rect.top - playRect.top;
    
    return (x >= containerX - 50 && x <= containerX + rect.width + 50 &&
            y >= containerY - 50 && y <= containerY + rect.height + 50);
}

// Color selection
function selectColor(colorName) {
    // Remove previous selection
    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new color
    const selectedElement = document.querySelector(`[data-color="${colorName}"]`);
    if (selectedElement && selectedElement.classList.contains('color-option')) {
        selectedElement.classList.add('selected');
        
        // Speak color name
        speakText(`Has seleccionado el color ${colorName}`);
        
        // Visual feedback
        selectedElement.classList.add('correct');
        setTimeout(() => selectedElement.classList.remove('correct'), 600);
        
        // Update score
        updateScore(5);
    }
}

// Drag and Drop Handlers
function handleDragStart(e) {
    if (!e.target.classList.contains('draggable-object')) return;
    
    dragState.isDragging = true;
    dragState.draggedElement = e.target;
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    playSound('pickup');
}

function handleDragEnd(e) {
    if (!e.target.classList.contains('draggable-object')) return;
    
    e.target.classList.remove('dragging');
    dragState.isDragging = false;
    dragState.draggedElement = null;
    
    // Remove all drop zone highlights
    document.querySelectorAll('.container-box').forEach(container => {
        container.classList.remove('drop-zone', 'valid', 'invalid');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    if (!e.target.classList.contains('container-box')) return;
    
    e.target.classList.add('drop-zone');
    dragState.currentDropZone = e.target;
}

function handleDragLeave(e) {
    if (!e.target.classList.contains('container-box')) return;
    
    e.target.classList.remove('drop-zone', 'valid', 'invalid');
    
    if (dragState.currentDropZone === e.target) {
        dragState.currentDropZone = null;
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    if (!e.target.classList.contains('container-box') || !dragState.draggedElement) return;
    
    const targetPosition = e.target.getAttribute('data-position');
    const objectColor = dragState.draggedElement.getAttribute('data-color');
    
    // Check if this is the correct solution
    const levelData = gameData[gameState.currentLevel];
    const challenge = levelData.challenges[gameState.currentChallenge];
    
    if (targetPosition === challenge.position && objectColor === challenge.color) {
        // Correct!
        handleCorrectDrop(e.target, dragState.draggedElement);
    } else {
        // Incorrect
        handleIncorrectDrop(e.target, dragState.draggedElement);
    }
    
    // Clean up
    e.target.classList.remove('drop-zone', 'valid', 'invalid');
}

// Handle correct drop
function handleCorrectDrop(container, object) {
    // Position object in container
    const containerRect = container.getBoundingClientRect();
    const playAreaRect = document.getElementById('playArea').getBoundingClientRect();
    
    const x = containerRect.left - playAreaRect.left + (containerRect.width - 60) / 2;
    const y = containerRect.top - playAreaRect.top + (containerRect.height - 60) / 2;
    
    object.style.left = x + 'px';
    object.style.top = y + 'px';
    object.style.transform = 'scale(1.2)';
    
    // Visual feedback
    container.classList.add('valid');
    
    // Audio feedback
    playSound('success');
    speakText('¡Correcto! Muy bien hecho.');
    
    // Update score
    updateScore(20);
    
    // Enable next button
    document.getElementById('nextBtn').disabled = false;
    
    // Show success feedback
    setTimeout(() => {
        showFeedback('success', '¡Excelente!', 'Has colocado el objeto en el lugar correcto');
    }, 500);
    
    console.log('Respuesta correcta');
}

// Handle incorrect drop
function handleIncorrectDrop(container, object) {
    // Visual feedback
    container.classList.add('invalid');
    
    // Return object to original position (animate back)
    setTimeout(() => {
        positionObjectRandomly(object, 'none');
    }, 500);
    
    // Audio feedback
    playSound('error');
    speakText('Inténtalo de nuevo. Revisa el color y la posición.');
    
    // Show error feedback
    showFeedback('error', 'Inténtalo otra vez', 'Revisa el color y la posición');
    
    console.log('Respuesta incorrecta');
}

// Touch Events for Mobile
let touchState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    touchedElement: null
};

function handleTouchStart(e) {
    if (!e.target.classList.contains('draggable-object')) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
    touchState.touchedElement = e.target;
    
    e.target.classList.add('dragging');
    playSound('pickup');
}

function handleTouchMove(e) {
    if (!touchState.touchedElement) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    touchState.currentX = touch.clientX;
    touchState.currentY = touch.clientY;
    
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = touchState.currentY - touchState.startY;
    
    const object = touchState.touchedElement;
    const currentLeft = parseInt(object.style.left) || 0;
    const currentTop = parseInt(object.style.top) || 0;
    
    object.style.left = (currentLeft + deltaX) + 'px';
    object.style.top = (currentTop + deltaY) + 'px';
    
    touchState.startX = touchState.currentX;
    touchState.startY = touchState.currentY;
    
    // Check for drop zones
    const elementBelow = document.elementFromPoint(touchState.currentX, touchState.currentY);
    if (elementBelow && elementBelow.classList.contains('container-box')) {
        if (dragState.currentDropZone !== elementBelow) {
            // Remove highlight from previous zone
            if (dragState.currentDropZone) {
                dragState.currentDropZone.classList.remove('drop-zone');
            }
            // Add highlight to new zone
            elementBelow.classList.add('drop-zone');
            dragState.currentDropZone = elementBelow;
        }
    } else {
        // Remove all highlights
        if (dragState.currentDropZone) {
            dragState.currentDropZone.classList.remove('drop-zone');
            dragState.currentDropZone = null;
        }
    }
}

function handleTouchEnd(e) {
    if (!touchState.touchedElement) return;
    
    e.preventDefault();
    
    const object = touchState.touchedElement;
    object.classList.remove('dragging');
    
    // Check if dropped on a valid container
    const elementBelow = document.elementFromPoint(touchState.currentX, touchState.currentY);
    if (elementBelow && elementBelow.classList.contains('container-box')) {
        const targetPosition = elementBelow.getAttribute('data-position');
        const objectColor = object.getAttribute('data-color');
        
        // Check if this is the correct solution
        const levelData = gameData[gameState.currentLevel];
        const challenge = levelData.challenges[gameState.currentChallenge];
        
        if (targetPosition === challenge.position && objectColor === challenge.color) {
            handleCorrectDrop(elementBelow, object);
        } else {
            handleIncorrectDrop(elementBelow, object);
        }
    }
    
    // Clean up
    if (dragState.currentDropZone) {
        dragState.currentDropZone.classList.remove('drop-zone');
        dragState.currentDropZone = null;
    }
    
    touchState.touchedElement = null;
}

// Game Controls
function readInstruction() {
    const instruction = document.getElementById('instructionText').textContent;
    speakText(instruction);
    playSound('read');
}

function showHint() {
    const levelData = gameData[gameState.currentLevel];
    const challenge = levelData.challenges[gameState.currentChallenge];
    
    const hint = `Busca el objeto de color ${challenge.color} y colócalo ${challenge.position} de la caja`;
    
    showFeedback('success', '💡 Pista', hint);
    speakText(hint);
    playSound('hint');
}

function nextChallenge() {
    gameState.currentChallenge++;
    gameState.completedChallenges++;
    
    const levelData = gameData[gameState.currentLevel];
    
    if (gameState.currentChallenge >= levelData.challenges.length) {
        completeLevel();
    } else {
        updateDisplay();
        loadChallenge();
        document.getElementById('nextBtn').disabled = true;
        showFeedback('success', '¡Siguiente ejercicio!', 'Continuemos aprendiendo');
        playSound('next');
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
        gameState.currentChallenge = 0;
        gameState.completedChallenges = 0;
        
        document.getElementById('levelComplete').classList.remove('show');
        document.getElementById('nextBtn').disabled = true;
        updateDisplay();
        loadChallenge();
        
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
    if (gameState.currentChallenge >= levelData.challenges.length) {
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
                Has completado todos los niveles de "Colores y Posiciones"
            </p>
            <div style="background: linear-gradient(135deg, #48bb78, #68d391); color: white; 
                       padding: 2rem; border-radius: 20px; margin: 2rem 0;">
                <h2 style="margin-bottom: 1rem;">Tu Progreso Final:</h2>
                <p style="font-size: 1.2rem;">⭐ Puntos Totales: ${gameState.score}</p>
                <p style="font-size: 1.2rem;">🎨 Ejercicios Completados: ${gameState.completedChallenges}</p>
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
    speakText('¡Felicitaciones! Has completado todos los niveles de Colores y Posiciones.');
}

// Restart game
function restartGame() {
    gameState.currentLevel = 1;
    gameState.currentChallenge = 0;
    gameState.score = 0;
    gameState.completedChallenges = 0;
    
    // Reload page to reset everything
    location.reload();
}

// Update display elements
function updateDisplay() {
    const levelData = gameData[gameState.currentLevel];
    
    document.getElementById('levelDisplay').textContent = `Nivel ${gameState.currentLevel}`;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    
    const progress = (gameState.currentChallenge / levelData.challenges.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    
    const progressText = `Progreso: ${gameState.currentChallenge}/${levelData.challenges.length} ejercicios completados`;
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
        scoreElement.style.color = '#9f7aea';
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
    
    // Hide after 3 seconds
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 3000);
}

// Speech synthesis
function speakText(text) {
    if (!gameState.settings.soundEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = gameState.settings.speechRate;
    utterance.volume = gameState.settings.volume;
    utterance.pitch = 1.1;
    
    speechSynthesis.speak(utterance);
}

// Play sound effects
function playSound(type) {
    if (!gameState.settings.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(gameState.settings.volume * 0.1, audioContext.currentTime);
        
        switch(type) {
            case 'pickup':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'read':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
            case 'hint':
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
            case 'next':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
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

// Navigation functions
function goBack() {
    if (confirm('¿Quieres volver al menú principal?\n\nTu progreso se guardará automáticamente.')) {
        saveProgress();
        window.history.back();
    }
}

// Save progress
function saveProgress() {
    try {
        const progress = {
            level: gameState.currentLevel,
            challenge: gameState.currentChallenge,
            score: gameState.score,
            completed: gameState.completedChallenges,
            date: new Date().toISOString()
        };
        localStorage.setItem('juegoTeaColorsProgress', JSON.stringify(progress));
        console.log('Progreso guardado:', progress);
    } catch (error) {
        console.log('No se pudo guardar el progreso');
    }
}

// Load progress
function loadProgress() {
    try {
        const saved = localStorage.getItem('juegoTeaColorsProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            
            if (confirm(`¿Quieres continuar desde donde lo dejaste?\n\nNivel: ${progress.level}\nPuntos: ${progress.score}`)) {
                gameState.currentLevel = progress.level;
                gameState.currentChallenge = progress.challenge;
                gameState.score = progress.score;
                gameState.completedChallenges = progress.completed;
                
                updateDisplay();
                loadChallenge();
                
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
        showFeedback('success', '¡Bienvenido a Colores y Posiciones!', 'Aprende colores y conceptos espaciales');
        speakText('¡Bienvenido a Colores y Posiciones! Vamos a aprender colores y conceptos espaciales.');
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
    switch(e.key) {
        case ' ':
            e.preventDefault();
            readInstruction();
            break;
        case 'Enter':
            if (!document.getElementById('nextBtn').disabled) {
                nextChallenge();
            }
            break;
        case 'h':
        case 'H':
            showHint();
            break;
    }
});

console.log('🌈 Juego "Colores y Posiciones" completamente cargado y listo');