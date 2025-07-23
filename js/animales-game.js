// 🐄 Juego de Animales de la Granja - JuegoTEA
console.log('🐄 Iniciando juego de animales de la granja');

// Game State
const gameState = {
    currentMode: 'explore',
    currentAnimal: 0,
    score: 0,
    visitedAnimals: new Set(),
    quizCorrectAnswers: 0,
    sortingCompleted: false,
    settings: {
        soundEnabled: true,
        speechRate: 0.8,
        volume: 1.0
    }
};

// Animals data
const animals = [
    {
        name: 'vaca',
        emoji: '🐄',
        sound: 'Muuuuuu',
        size: 'grande',
        description: 'La vaca es un animal grande que nos da leche fresca y nutritiva.',
        facts: [
            'Las vacas pueden producir hasta 30 litros de leche al día',
            'Tienen cuatro estómagos para digerir mejor la hierba',
            'Son animales muy inteligentes y tienen buena memoria'
        ],
        habitat: 'pastizales y establos',
        food: 'hierba, heno y granos'
    },
    {
        name: 'cerdo',
        emoji: '🐷',
        sound: 'Oink Oink',
        size: 'mediano',
        description: 'El cerdo es un animal muy inteligente que vive en la granja.',
        facts: [
            'Los cerdos son más inteligentes que los perros',
            'Les gusta revolcarse en el barro para refrescarse',
            'Tienen un excelente sentido del olfato'
        ],
        habitat: 'corrales y chiqueros',
        food: 'granos, frutas y verduras'
    },
    {
        name: 'pollo',
        emoji: '🐔',
        sound: 'pio pio',
        size: 'pequeño',
        description: 'El pollo es un ave doméstica que pone huevos y nos da carne.',
        facts: [
            'Una gallina puede poner más de 300 huevos al año',
            'Los pollos pueden recordar más de 100 caras',
            'Son descendientes de los dinosaurios'
        ],
        habitat: 'gallineros y patios',
        food: 'granos, insectos y verduras'
    },
    {
        name: 'oveja',
        emoji: '🐑',
        sound: 'Bee',
        size: 'mediano',
        description: 'La oveja nos proporciona lana suave y caliente para hacer ropa.',
        facts: [
            'Su lana crece continuamente y necesita ser cortada',
            'Tienen una excelente memoria y reconocen caras',
            'Viven en grupos llamados rebaños'
        ],
        habitat: 'pastizales y rediles',
        food: 'hierba, trébol y plantas'
    },
    {
        name: 'cabra',
        emoji: '🐐',
        sound: 'Mee',
        size: 'mediano',
        description: 'La cabra es un animal ágil que puede trepar montañas y rocas.',
        facts: [
            'Son excelentes escaladoras y muy ágiles',
            'Su leche es muy nutritiva y fácil de digerir',
            'Tienen pupilas rectangulares para ver mejor'
        ],
        habitat: 'corrales y montañas',
        food: 'hierba, hojas y arbustos'
    },
    {
        name: 'caballo',
        emoji: '🐴',
        sound: 'Relincho',
        size: 'grande',
        description: 'El caballo es un animal fuerte que ayuda en el trabajo de la granja.',
        facts: [
            'Pueden correr hasta 70 kilómetros por hora',
            'Duermen tanto de pie como acostados',
            'Tienen una memoria excelente y son muy leales'
        ],
        habitat: 'establos y pastizales',
        food: 'hierba, heno y avena'
    },
    {
        name: 'pato',
        emoji: '🦆',
        sound: 'Cuac',
        size: 'pequeño',
        description: 'El pato es un ave acuática que nada muy bien en estanques.',
        facts: [
            'Sus plumas son impermeables al agua',
            'Tienen patas palmeadas para nadar mejor',
            'Pueden volar largas distancias'
        ],
        habitat: 'estanques y corrales',
        food: 'plantas acuáticas, insectos y granos'
    },
    {
        name: 'conejo',
        emoji: '🐰',
        sound: 'Chirrido suave',
        size: 'pequeño',
        description: 'El conejo es un animal pequeño y rápido con orejas largas.',
        facts: [
            'Pueden saltar hasta 1 metro de altura',
            'Sus dientes crecen durante toda su vida',
            'Son muy sociables y viven en grupos'
        ],
        habitat: 'conejeras y madrigueras',
        food: 'hierba, verduras y heno'
    },
    {
        name: 'gallo',
        emoji: '🐓',
        sound: 'Quiquiriquí',
        size: 'pequeño',
        description: 'El gallo es el macho de la gallina y canta al amanecer.',
        facts: [
            'Su canto marca el inicio del día',
            'Tienen plumas muy coloridas y vistosas',
            'Protegen a las gallinas de los peligros'
        ],
        habitat: 'gallineros y patios',
        food: 'granos, insectos y verduras'
    },
    {
        name: 'burro',
        emoji: '🫏',
        sound: 'Rebuzno',
        size: 'mediano',
        description: 'El burro es un animal trabajador que ayuda a cargar cosas pesadas.',
        facts: [
            'Son muy resistentes y pueden trabajar muchas horas',
            'Tienen una memoria excelente para los caminos',
            'Son más pequeños que los caballos pero muy fuertes'
        ],
        habitat: 'establos y campos',
        food: 'hierba, heno y granos'
    }
];

// Quiz questions data
const quizQuestions = [
    {
        question: '¿Qué animal hace "Muu"?',
        sound: 'Muu',
        correctAnswer: 'vaca',
        options: ['vaca', 'cerdo', 'oveja', 'caballo']
    },
    {
        question: '¿Qué animal hace "Oink"?',
        sound: 'Oink', 
        correctAnswer: 'cerdo',
        options: ['pollo', 'cerdo', 'pato', 'conejo']
    },
    {
        question: '¿Qué animal hace "Quiquiriquí"?',
        sound: 'Quiquiriquí',
        correctAnswer: 'gallo',
        options: ['gallo', 'pollo', 'pato', 'oveja']
    },
    {
        question: '¿Qué animal hace "Cuac"?',
        sound: 'Cuac',
        correctAnswer: 'pato',
        options: ['pollo', 'gallo', 'pato', 'conejo']
    },
    {
        question: '¿Qué animal hace "Bee"?',
        sound: 'Bee',
        correctAnswer: 'oveja',
        options: ['cabra', 'oveja', 'vaca', 'burro']
    }
];

let currentQuiz = 0;

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
    setGameMode('explore');
    setupDragAndDrop();
    console.log('🐄 Juego de animales inicializado');
}

// Set game mode
function setGameMode(mode) {
    gameState.currentMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}Btn`).classList.add('active');
    
    // Hide all modes
    document.querySelectorAll('.game-mode').forEach(modeEl => {
        modeEl.style.display = 'none';
    });
    
    // Show selected mode
    const modeElement = document.getElementById(`${mode}Mode`);
    if (modeElement) {
        modeElement.style.display = 'block';
    }
    
    // Initialize mode-specific content
    switch(mode) {
        case 'explore':
            initializeExploreMode();
            break;
        case 'sounds':
            initializeSoundsMode();
            break;
        case 'quiz':
            initializeQuizMode();
            break;
        case 'sorting':
            initializeSortingMode();
            break;
    }
    
    updateDisplay();
    updateControlsVisibility();
}

// Initialize explore mode
function initializeExploreMode() {
    loadAnimalCard();
}

// Load animal card for exploration
function loadAnimalCard() {
    const animal = animals[gameState.currentAnimal];
    const animalCard = document.getElementById('animalCard');
    
    animalCard.innerHTML = `
        <div class="animal-emoji" onclick="playAnimalSound()">${animal.emoji}</div>
        <div class="animal-info">
            <div class="animal-name">${animal.name.toUpperCase()}</div>
            <div class="animal-description">${animal.description}</div>
            <div class="animal-facts">
                <h4>🏠 Hábitat:</h4>
                <p>${animal.habitat}</p>
                <h4>🍽️ Alimentación:</h4>
                <p>${animal.food}</p>
            </div>
        </div>
    `;
    
    // Mark as visited
    gameState.visitedAnimals.add(gameState.currentAnimal);
    
    // Speak animal name
    setTimeout(() => {
        speakText(`Este es ${animal.name}. ${animal.description}`);
    }, 500);
}

// Initialize sounds mode
function initializeSoundsMode() {
    const soundsGrid = document.getElementById('soundsGrid');
    soundsGrid.innerHTML = '';
    soundsGrid.style.display = 'grid';
    soundsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    soundsGrid.style.gap = '1rem';
    
    animals.forEach((animal, index) => {
        const soundButton = document.createElement('div');
        soundButton.className = 'quiz-option';
        soundButton.style.cursor = 'pointer';
        soundButton.innerHTML = `
            <div class="option-emoji">${animal.emoji}</div>
            <div class="option-text">${animal.name}</div>
        `;
        
        soundButton.onclick = () => {
            playAnimalSoundByName(animal.name);
            soundButton.classList.add('selected');
            setTimeout(() => soundButton.classList.remove('selected'), 1000);
        };
        
        soundsGrid.appendChild(soundButton);
    });
}

// Initialize quiz mode
function initializeQuizMode() {
    if (currentQuiz >= quizQuestions.length) {
        showQuizComplete();
        return;
    }
    
    const question = quizQuestions[currentQuiz];
    document.getElementById('quizQuestion').textContent = question.question;
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const animal = animals.find(a => a.name === option);
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option';
        optionElement.innerHTML = `
            <div class="option-emoji">${animal.emoji}</div>
            <div class="option-text">${animal.name}</div>
        `;
        
        optionElement.onclick = () => selectQuizOption(option, optionElement);
        optionsContainer.appendChild(optionElement);
    });
    
    // Auto-play sound after a delay
    setTimeout(() => {
        speakText(`Escucha: ${question.sound}`);
    }, 1000);
}

// Select quiz option
function selectQuizOption(selectedOption, optionElement) {
    const question = quizQuestions[currentQuiz];
    const allOptions = document.querySelectorAll('#quizOptions .quiz-option');
    
    // Disable all options
    allOptions.forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    
    if (selectedOption === question.correctAnswer) {
        // Correct answer
        optionElement.classList.add('correct');
        updateScore(20);
        gameState.quizCorrectAnswers++;
        playSound('success');
        speakText('¡Correcto! Muy bien.');
        
        setTimeout(() => {
            currentQuiz++;
            initializeQuizMode();
        }, 2000);
    } else {
        // Incorrect answer
        optionElement.classList.add('incorrect');
        playSound('error');
        speakText('Inténtalo de nuevo. Escucha el sonido otra vez.');
        
        // Show correct answer
        const correctOption = Array.from(allOptions).find(opt => 
            opt.querySelector('.option-text').textContent === question.correctAnswer
        );
        if (correctOption) {
            setTimeout(() => {
                correctOption.classList.add('correct');
                speakText(`La respuesta correcta es ${question.correctAnswer}`);
            }, 1000);
        }
        
        setTimeout(() => {
            currentQuiz++;
            initializeQuizMode();
        }, 3000);
    }
}

// Show quiz complete
function showQuizComplete() {
    const quizContainer = document.querySelector('#quizMode .quiz-container');
    quizContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h2 style="color: #48bb78; margin-bottom: 1rem;">🎉 ¡Quiz Completado!</h2>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
                Respondiste correctamente ${gameState.quizCorrectAnswers} de ${quizQuestions.length} preguntas
            </p>
            <div style="margin: 2rem 0;">
                <button class="btn btn-primary" onclick="restartQuiz()">
                    🔄 Intentar de Nuevo
                </button>
            </div>
        </div>
    `;
    
    updateScore(gameState.quizCorrectAnswers * 10);
    playSound('levelComplete');
}

// Restart quiz
function restartQuiz() {
    currentQuiz = 0;
    gameState.quizCorrectAnswers = 0;
    initializeQuizMode();
}

// Initialize sorting mode
function initializeSortingMode() {
    const sortableContainer = document.getElementById('sortableAnimals');
    sortableContainer.innerHTML = '';
    
    // Create shuffled array of animals for sorting
    const sortingAnimals = [...animals].sort(() => Math.random() - 0.5).slice(0, 6);
    
    sortingAnimals.forEach((animal, index) => {
        const animalElement = document.createElement('div');
        animalElement.className = 'sortable-animal';
        animalElement.textContent = animal.emoji;
        animalElement.setAttribute('draggable', 'true');
        animalElement.setAttribute('data-animal', animal.name);
        animalElement.setAttribute('data-size', animal.size);
        
        sortableContainer.appendChild(animalElement);
    });
    
    // Clear sorting areas
    document.querySelectorAll('.sorted-animals').forEach(area => {
        area.innerHTML = '';
    });
    
    gameState.sortingCompleted = false;
}

// Setup drag and drop for sorting
function setupDragAndDrop() {
    document.addEventListener('dragstart', handleSortingDragStart);
    document.addEventListener('dragend', handleSortingDragEnd);
    document.addEventListener('dragover', handleSortingDragOver);
    document.addEventListener('drop', handleSortingDrop);
    document.addEventListener('dragenter', handleSortingDragEnter);
    document.addEventListener('dragleave', handleSortingDragLeave);
}

// Sorting drag handlers
function handleSortingDragStart(e) {
    if (!e.target.classList.contains('sortable-animal')) return;
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    playSound('pickup');
}

function handleSortingDragEnd(e) {
    if (!e.target.classList.contains('sortable-animal')) return;
    
    e.target.classList.remove('dragging');
    
    // Remove all drop zone highlights
    document.querySelectorAll('.sorting-area').forEach(area => {
        area.classList.remove('drop-zone');
    });
}

function handleSortingDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleSortingDragEnter(e) {
    if (!e.target.closest('.sorting-area')) return;
    
    const sortingArea = e.target.closest('.sorting-area');
    sortingArea.classList.add('drop-zone');
}

function handleSortingDragLeave(e) {
    if (!e.target.closest('.sorting-area')) return;
    
    const sortingArea = e.target.closest('.sorting-area');
    sortingArea.classList.remove('drop-zone');
}

function handleSortingDrop(e) {
    e.preventDefault();
    
    const sortingArea = e.target.closest('.sorting-area');
    if (!sortingArea) return;
    
    const draggedElement = document.querySelector('.sortable-animal.dragging');
    if (!draggedElement) return;
    
    const animalSize = draggedElement.getAttribute('data-size');
    const targetSize = sortingArea.getAttribute('data-size');
    
    // Remove from original container
    draggedElement.remove();
    
    // Add to target area
    const sortedContainer = sortingArea.querySelector('.sorted-animals');
    const newElement = document.createElement('div');
    newElement.className = 'sortable-animal';
    newElement.textContent = draggedElement.textContent;
    newElement.setAttribute('data-animal', draggedElement.getAttribute('data-animal'));
    newElement.setAttribute('data-size', animalSize);
    
    if (animalSize === targetSize) {
        // Correct placement
        newElement.style.borderColor = '#48bb78';
        newElement.style.backgroundColor = '#f0fff4';
        playSound('success');
        updateScore(15);
    } else {
        // Incorrect placement
        newElement.style.borderColor = '#e53e3e';
        newElement.style.backgroundColor = '#fed7d7';
        playSound('error');
    }
    
    sortedContainer.appendChild(newElement);
    sortingArea.classList.remove('drop-zone');
    
    // Check if sorting is complete
    checkSortingComplete();
}

// Check if sorting is complete
function checkSortingComplete() {
    const remainingAnimals = document.querySelectorAll('#sortableAnimals .sortable-animal');
    
    if (remainingAnimals.length === 0) {
        gameState.sortingCompleted = true;
        
        setTimeout(() => {
            showFeedback('success', '🎉 ¡Clasificación Completa!', 'Has ordenado todos los animales');
            speakText('¡Excelente! Has clasificado todos los animales por tamaño.');
            updateScore(50);
        }, 500);
    }
}

// Game controls
function playAnimalSound() {
    if (gameState.currentMode === 'explore') {
        const animal = animals[gameState.currentAnimal];
        speakText(`${animal.name} hace ${animal.sound}`);
        playSound('animalSound');
        updateScore(5);
    }
}

function playAnimalSoundByName(animalName) {
    const animal = animals.find(a => a.name === animalName);
    if (animal) {
        speakText(`${animal.name} hace ${animal.sound}`);
        playSound('animalSound');
        updateScore(5);
    }
}

function showAnimalFacts() {
    if (gameState.currentMode === 'explore') {
        const animal = animals[gameState.currentAnimal];
        const randomFact = animal.facts[Math.floor(Math.random() * animal.facts.length)];
        
        showFeedback('success', '📚 Dato Curioso', randomFact);
        speakText(`Dato curioso sobre ${animal.name}: ${randomFact}`);
        updateScore(5);
    }
}

function nextAnimal() {
    if (gameState.currentMode === 'explore') {
        gameState.currentAnimal = (gameState.currentAnimal + 1) % animals.length;
        loadAnimalCard();
        updateDisplay();
        playSound('next');
        updateScore(10);
    }
}

// Update display elements
function updateDisplay() {
    let levelText, progressText;
    
    switch(gameState.currentMode) {
        case 'explore':
            levelText = 'Modo Exploración';
            progressText = `Animal ${gameState.currentAnimal + 1} de ${animals.length}`;
            break;
        case 'sounds':
            levelText = 'Modo Sonidos';
            progressText = 'Haz clic en los animales para escuchar';
            break;
        case 'quiz':
            levelText = 'Modo Quiz';
            progressText = `Pregunta ${currentQuiz + 1} de ${quizQuestions.length}`;
            break;
        case 'sorting':
            levelText = 'Modo Clasificación';
            progressText = gameState.sortingCompleted ? 'Clasificación completa' : 'Arrastra animales por tamaño';
            break;
    }
    
    document.getElementById('levelDisplay').textContent = levelText;
    document.getElementById('progressText').textContent = progressText;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    
    // Update progress bar
    let progress = 0;
    switch(gameState.currentMode) {
        case 'explore':
            progress = ((gameState.currentAnimal + 1) / animals.length) * 100;
            break;
        case 'quiz':
            progress = (currentQuiz / quizQuestions.length) * 100;
            break;
        case 'sorting':
            const remainingAnimals = document.querySelectorAll('#sortableAnimals .sortable-animal').length;
            const totalAnimals = 6; // We show 6 animals for sorting
            progress = ((totalAnimals - remainingAnimals) / totalAnimals) * 100;
            break;
        default:
            progress = 0;
    }
    
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Update controls visibility
function updateControlsVisibility() {
    const soundBtn = document.getElementById('soundBtn');
    const factsBtn = document.getElementById('factsBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (gameState.currentMode === 'explore') {
        soundBtn.style.display = 'flex';
        factsBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    } else {
        soundBtn.style.display = 'none';
        factsBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
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
        scoreElement.style.color = '#38b2ac';
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
            case 'animalSound':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                break;
            case 'next':
                oscillator.frequency.setValueAtTime(350, audioContext.currentTime);
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
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
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

// Restart exploration
function restartExploration() {
    gameState.currentAnimal = 0;
    gameState.visitedAnimals.clear();
    currentQuiz = 0;
    gameState.quizCorrectAnswers = 0;
    gameState.sortingCompleted = false;
    
    setGameMode('explore');
    updateScore(10);
}

// Save progress
function saveProgress() {
    try {
        const progress = {
            currentAnimal: gameState.currentAnimal,
            score: gameState.score,
            visitedAnimals: Array.from(gameState.visitedAnimals),
            mode: gameState.currentMode,
            date: new Date().toISOString()
        };
        localStorage.setItem('juegoTeaAnimalsProgress', JSON.stringify(progress));
        console.log('Progreso guardado:', progress);
    } catch (error) {
        console.log('No se pudo guardar el progreso');
    }
}

// Load progress
function loadProgress() {
    try {
        const saved = localStorage.getItem('juegoTeaAnimalsProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            
            if (confirm(`¿Quieres continuar desde donde lo dejaste?\n\nAnimal: ${animals[progress.currentAnimal]?.name}\nPuntos: ${progress.score}`)) {
                gameState.currentAnimal = progress.currentAnimal;
                gameState.score = progress.score;
                gameState.visitedAnimals = new Set(progress.visitedAnimals);
                
                setGameMode(progress.mode || 'explore');
                updateDisplay();
                
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
        showFeedback('success', '¡Bienvenido a la Granja!', 'Explora y aprende sobre los animales');
        speakText('¡Bienvenido a Animales de la Granja! Vamos a conocer a todos los animales.');
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
            if (gameState.currentMode === 'explore') {
                playAnimalSound();
            }
            break;
        case 'Enter':
            if (gameState.currentMode === 'explore') {
                nextAnimal();
            }
            break;
        case 'f':
        case 'F':
            if (gameState.currentMode === 'explore') {
                showAnimalFacts();
            }
            break;
        case '1':
            setGameMode('explore');
            break;
        case '2':
            setGameMode('sounds');
            break;
        case '3':
            setGameMode('quiz');
            break;
        case '4':
            setGameMode('sorting');
            break;
    }
});

console.log('🐄 Juego "Animales de la Granja" completamente cargado y listo');