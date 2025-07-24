// 🌈 Juego de Colores y Posiciones Rediseñado - JuegoTEA
        console.log('🌈 Iniciando juego de colores y posiciones rediseñado');

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
            rojo: { hex: '#e53e3e', name: 'rojo', symbol: '●' },
            azul: { hex: '#3182ce', name: 'azul', symbol: '●' },
            verde: { hex: '#38a169', name: 'verde', symbol: '●' },
            amarillo: { hex: '#d69e2e', name: 'amarillo', symbol: '●' },
            naranja: { hex: '#dd6b20', name: 'naranja', symbol: '●' },
            morado: { hex: '#805ad5', name: 'morado', symbol: '●' }
        };

        // Directions data
        const directions = {
            izquierda: { name: 'izquierda', target: 'target-left', position: { left: '50px', top: '160px' } },
            derecha: { name: 'derecha', target: 'target-right', position: { right: '50px', top: '160px' } },
            arriba: { name: 'arriba', target: 'target-up', position: { left: '210px', top: '50px' } },
            abajo: { name: 'abajo', target: 'target-down', position: { left: '210px', bottom: '50px' } }
        };

        // Game Data - Structured by levels
        const gameData = {
            1: {
                name: "Direcciones Básicas",
                colors: ['rojo', 'azul', 'verde', 'amarillo'],
                directions: ['izquierda', 'derecha', 'arriba', 'abajo'],
                challenges: [
                    { color: 'rojo', direction: 'izquierda' },
                    { color: 'azul', direction: 'derecha' },
                    { color: 'verde', direction: 'arriba' },
                    { color: 'amarillo', direction: 'abajo' },
                    { color: 'rojo', direction: 'derecha' }
                ]
            },
            2: {
                name: "Colores Avanzados",
                colors: ['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado'],
                directions: ['izquierda', 'derecha', 'arriba', 'abajo'],
                challenges: [
                    { color: 'naranja', direction: 'izquierda' },
                    { color: 'morado', direction: 'arriba' },
                    { color: 'verde', direction: 'derecha' },
                    { color: 'azul', direction: 'abajo' },
                    { color: 'naranja', direction: 'arriba' }
                ]
            },
            3: {
                name: "Desafío Completo",
                colors: ['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado'],
                directions: ['izquierda', 'derecha', 'arriba', 'abajo'],
                challenges: [
                    { color: 'morado', direction: 'izquierda' },
                    { color: 'naranja', direction: 'derecha' },
                    { color: 'verde', direction: 'abajo' },
                    { color: 'azul', direction: 'arriba' },
                    { color: 'rojo', direction: 'izquierda' }
                ]
            }
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
            setupKeyboardControls();
            updateDisplay();
            loadChallenge();
            console.log('🌈 Juego de colores inicializado');
        }

        // Setup keyboard controls
        function setupKeyboardControls() {
            document.addEventListener('keydown', function(e) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        moveObject('izquierda');
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        moveObject('derecha');
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        moveObject('arriba');
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        moveObject('abajo');
                        break;
                    case ' ':
                        e.preventDefault();
                        readInstruction();
                        break;
                    case 'Enter':
                        if (!document.getElementById('nextBtn').disabled) {
                            nextChallenge();
                        }
                        break;
                }
            });
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
            const instruction = `Mueve el círculo ${challenge.color.toUpperCase()} hacia la ${challenge.direction.toUpperCase()}`;
            document.getElementById('instructionText').textContent = instruction;
            
            // Update object color and position
            const movingObject = document.getElementById('movingObject');
            const color = colors[challenge.color];
            movingObject.style.backgroundColor = color.hex;
            movingObject.textContent = color.symbol;
            
            // Reset object to center
            resetObjectPosition();
            
            // Highlight target direction
            highlightTarget(challenge.direction);
            
            // Speak instruction
            setTimeout(() => {
                speakText(instruction);
            }, 500);
        }

        // Reset object to center position
        function resetObjectPosition() {
            const movingObject = document.getElementById('movingObject');
            movingObject.style.left = '210px'; // Center horizontally
            movingObject.style.top = '160px';  // Center vertically
            movingObject.style.right = 'auto';
            movingObject.style.bottom = 'auto';
            movingObject.classList.remove('correct');
        }

        // Highlight target direction
        function highlightTarget(targetDirection) {
            // Remove all highlights
            document.querySelectorAll('.direction-target').forEach(target => {
                target.classList.remove('active');
            });
            
            // Highlight correct target
            const target = document.querySelector(`[data-direction="${targetDirection}"]`);
            if (target) {
                target.classList.add('active');
            }
        }

        // Move object in specified direction
        function moveObject(direction) {
            const movingObject = document.getElementById('movingObject');
            const levelData = gameData[gameState.currentLevel];
            const challenge = levelData.challenges[gameState.currentChallenge];
            
            if (!challenge) return;
            
            // Get direction data
            const directionData = directions[direction];
            if (!directionData) return;
            
            // Visual feedback - button press
            const btn = document.querySelector(`[data-direction="${direction}"]`);
            if (btn) {
                btn.style.transform = 'translateY(-1px) scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            }
            
            // Move object to target position
            movingObject.style.left = 'auto';
            movingObject.style.top = 'auto';
            movingObject.style.right = 'auto';
            movingObject.style.bottom = 'auto';
            
            // Apply position based on direction
            Object.assign(movingObject.style, directionData.position);
            
            // Play movement sound
            playSound('move');
            
            // Check if correct
            if (direction === challenge.direction) {
                handleCorrectMove();
            } else {
                handleIncorrectMove(direction, challenge.direction);
            }
        }

        // Handle correct move
        function handleCorrectMove() {
            const movingObject = document.getElementById('movingObject');
            const levelData = gameData[gameState.currentLevel];
            const challenge = levelData.challenges[gameState.currentChallenge];
            
            // Visual feedback
            movingObject.classList.add('correct');
            
            // Audio feedback
            playSound('success');
            speakText('¡Correcto! Muy bien hecho.');
            
            // Update score
            updateScore(20);
            
            // Enable next button
            document.getElementById('nextBtn').disabled = false;
            
            // Remove target highlight
            document.querySelectorAll('.direction-target').forEach(target => {
                target.classList.remove('active');
            });
            
            // Show success feedback
            setTimeout(() => {
                showFeedback('success', '¡Excelente!', `Has movido el círculo ${challenge.color} hacia la ${challenge.direction} correctamente`);
            }, 500);
            
            console.log('Respuesta correcta');
        }

        // Handle incorrect move
        function handleIncorrectMove(userDirection, correctDirection) {
            // Audio feedback
            playSound('error');
            speakText(`No, inténtalo de nuevo. Mueve hacia la ${correctDirection}.`);
            
            // Show error feedback
            showFeedback('error', 'Inténtalo otra vez', `Debes mover hacia la ${correctDirection}, no hacia la ${userDirection}`);
            
            // Reset position after a delay
            setTimeout(() => {
                resetObjectPosition();
            }, 1000);
            
            console.log('Respuesta incorrecta');
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
            
            if (!challenge) return;
            
            const hint = `Busca el círculo de color ${challenge.color} y muévelo usando las flechas hacia la ${challenge.direction}`;
            
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
                    case 'move':
                        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
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
                        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
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
                showFeedback('success', '¡Bienvenido a Colores y Posiciones!', 'Usa las flechas del teclado o los botones para mover el objeto');
                speakText('¡Bienvenido a Colores y Posiciones! Usa las flechas del teclado o los botones para mover el objeto del color indicado hacia la dirección correcta.');
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

        // Add accessibility features
        document.addEventListener('keydown', function(e) {
            // Help shortcut
            if (e.key === 'h' || e.key === 'H') {
                showHint();
            }
        });

        // Touch support for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            const minSwipeDistance = 50;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        moveObject('derecha');
                    } else {
                        moveObject('izquierda');
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        moveObject('abajo');
                    } else {
                        moveObject('arriba');
                    }
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });

        console.log('🌈 Juego "Colores y Posiciones" completamente cargado y listo');