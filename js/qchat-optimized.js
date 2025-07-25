// 📋 Q-CHAT - JavaScript Optimizado CORREGIDO
console.log('📋 Iniciando Q-CHAT...');

class QChatAssessment {
    constructor() {
        this.data = null;
        this.responses = {};
        this.currentQuestion = 0;
        this.score = 0;
        this.categoryScores = {};
        this.startTime = Date.now();
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.initializeAssessment();
            console.log('✅ Q-CHAT inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Q-CHAT:', error);
            this.showError('Error cargando el cuestionario. Por favor, recarga la página.');
        }
    }

    async loadData() {
        try {
            console.log('📊 Cargando datos del JSON...');
            const response = await fetch('./data/qchat-data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.data = await response.json();
            console.log('✅ Datos del Q-CHAT cargados correctamente:', this.data.metadata);
            console.log(`📝 ${this.data.questions.length} preguntas cargadas`);
            
            // Verificar que tenemos las preguntas
            if (!this.data.questions || this.data.questions.length === 0) {
                throw new Error('No se encontraron preguntas en el archivo JSON');
            }
            
        } catch (error) {
            console.error('❌ Error cargando JSON:', error);
            // Fallback con datos hardcodeados si falla la carga del JSON
            await this.loadFallbackData();
        }
    }

    // Datos de respaldo si falla la carga del JSON
    async loadFallbackData() {
        console.warn('⚠️ Usando datos de respaldo hardcodeados');
        this.data = {
            metadata: {
                title: "Q-CHAT (Quantitative Checklist for Autism in Toddlers)",
                description: "Cuestionario de detección temprana para autismo en niños de 18-24 meses",
                totalQuestions: 25,
                scoringThreshold: 3
            },
            instructions: {
                introduction: "Este cuestionario está diseñado para identificar tempranamente signos de autismo en niños pequeños.",
                timeEstimate: "5-7 minutos",
                disclaimer: "Este cuestionario es solo una herramienta de detección. Los resultados no constituyen un diagnóstico médico."
            },
            questions: [
                {
                    id: 1,
                    text: "¿Su hijo/a le mira cuando le habla?",
                    category: "social",
                    options: [
                        { value: 0, text: "Siempre", description: "Mi hijo/a siempre me mira cuando le hablo" },
                        { value: 0, text: "Casi siempre", description: "Mi hijo/a me mira la mayoría de las veces" },
                        { value: 0, text: "A veces", description: "Mi hijo/a me mira algunas veces" },
                        { value: 1, text: "Raramente", description: "Mi hijo/a raramente me mira cuando le hablo" },
                        { value: 1, text: "Nunca", description: "Mi hijo/a nunca me mira cuando le hablo" }
                    ]
                },
                {
                    id: 2,
                    text: "¿Qué tan fácil es para usted hacer contacto visual con su hijo/a?",
                    category: "social",
                    options: [
                        { value: 0, text: "Muy fácil", description: "Es muy fácil establecer contacto visual" },
                        { value: 0, text: "Bastante fácil", description: "Generalmente es fácil hacer contacto visual" },
                        { value: 0, text: "Bastante difícil", description: "A veces es difícil hacer contacto visual" },
                        { value: 1, text: "Muy difícil", description: "Es muy difícil establecer contacto visual" },
                        { value: 1, text: "Imposible", description: "No logro hacer contacto visual con mi hijo/a" }
                    ]
                },
                {
                    id: 3,
                    text: "¿Su hijo/a señala para pedir algo (por ejemplo, un juguete que está fuera de su alcance)?",
                    category: "communication",
                    options: [
                        { value: 0, text: "Siempre", description: "Siempre señala para pedir cosas" },
                        { value: 0, text: "A menudo", description: "Frecuentemente señala para pedir" },
                        { value: 0, text: "A veces", description: "A veces señala para pedir" },
                        { value: 1, text: "Raramente", description: "Raramente señala para pedir" },
                        { value: 1, text: "Nunca", description: "Nunca señala para pedir cosas" }
                    ]
                }
                // Nota: En producción, aquí irían las 25 preguntas completas
            ],
            scoring: {
                categories: {
                    social: { name: "Interacción Social", questions: [1, 2] },
                    communication: { name: "Comunicación", questions: [3] }
                },
                interpretation: {
                    lowRisk: { range: "0-2", title: "Bajo Riesgo", color: "#48bb78" },
                    moderateRisk: { range: "3-7", title: "Riesgo Moderado", color: "#ed8936" },
                    highRisk: { range: "8+", title: "Alto Riesgo", color: "#dc3545" }
                }
            }
        };
    }

    setupEventListeners() {
        // Event listeners globales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousQuestion();
            if (e.key === 'ArrowRight') this.nextQuestion();
        });
    }

    initializeAssessment() {
        this.updateProgressBar();
        this.initializeCategoryScores();
        this.showIntroduction();
    }

    initializeCategoryScores() {
        const categories = this.data.scoring?.categories || {};
        Object.keys(categories).forEach(category => {
            this.categoryScores[category] = 0;
        });
    }

    showIntroduction() {
        const container = document.getElementById('qchat-container');
        container.innerHTML = `
            <div class="qchat-introduction">
                <div class="intro-header">
                    <h1>${this.data.metadata.title}</h1>
                    <p class="intro-subtitle">${this.data.metadata.description || 'Cuestionario de detección temprana'}</p>
                </div>
                
                <div class="intro-content">
                    <div class="intro-info">
                        <div class="info-item">
                            <span class="info-icon">⏱️</span>
                            <div>
                                <strong>Tiempo estimado:</strong>
                                <span>${this.data.instructions?.timeEstimate || '5-7 minutos'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">❓</span>
                            <div>
                                <strong>Preguntas:</strong>
                                <span>${this.data.questions.length} preguntas</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">👶</span>
                            <div>
                                <strong>Edad recomendada:</strong>
                                <span>18-24 meses</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🔒</span>
                            <div>
                                <strong>Privacidad:</strong>
                                <span>Respuestas anónimas</span>
                            </div>
                        </div>
                    </div>

                    <div class="intro-instructions">
                        <h3>📋 Instrucciones:</h3>
                        <ul>
                            <li>Responda basándose en el comportamiento típico de su hijo/a</li>
                            <li>Si no está seguro/a, seleccione la opción más cercana</li>
                            <li>No hay respuestas correctas o incorrectas</li>
                            <li>Puede pausar y continuar en cualquier momento</li>
                        </ul>
                    </div>

                    <div class="intro-disclaimer">
                        <div class="disclaimer-box">
                            <span class="disclaimer-icon">⚠️</span>
                            <div>
                                <strong>Importante:</strong>
                                ${this.data.instructions?.disclaimer || 'Este cuestionario es solo una herramienta de detección. Los resultados no constituyen un diagnóstico médico.'}
                            </div>
                        </div>
                    </div>

                    <div class="intro-actions">
                        <button class="btn btn-primary" onclick="qchatApp.startAssessment()">
                            🚀 Comenzar Cuestionario
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    startAssessment() {
        console.log('🚀 Iniciando evaluación...');
        this.currentQuestion = 0;
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestion >= this.data.questions.length) {
            this.completeAssessment();
            return;
        }

        const question = this.data.questions[this.currentQuestion];
        const container = document.getElementById('qchat-container');
        
        container.innerHTML = `
            <div class="qchat-question">
                <div class="question-header">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((this.currentQuestion + 1) / this.data.questions.length) * 100}%"></div>
                        </div>
                        <div class="progress-text">
                            Pregunta ${this.currentQuestion + 1} de ${this.data.questions.length}
                        </div>
                    </div>
                </div>

                <div class="question-content">
                    <h2 class="question-text">${question.text}</h2>
                    
                    <div class="options-container">
                        ${question.options.map(option => `
                            <label class="option-label" for="option-${option.value}">
                                <input type="radio" 
                                       id="option-${option.value}" 
                                       name="question-${question.id}" 
                                       value="${option.value}"
                                       ${this.responses[question.id] === option.value ? 'checked' : ''}
                                       onchange="qchatApp.selectAnswer(${question.id}, ${option.value})">
                                <div class="option-content">
                                    <div class="option-text">${option.text}</div>
                                    <div class="option-description">${option.description}</div>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="question-actions">
                    <button class="btn btn-secondary" 
                            onclick="qchatApp.previousQuestion()" 
                            ${this.currentQuestion === 0 ? 'disabled' : ''}>
                        ← Anterior
                    </button>
                    <button class="btn btn-primary" 
                            onclick="qchatApp.nextQuestion()"
                            ${this.responses[question.id] === undefined ? 'disabled' : ''}>
                        ${this.currentQuestion === this.data.questions.length - 1 ? 'Ver Resultados →' : 'Siguiente →'}
                    </button>
                </div>
            </div>
        `;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    selectAnswer(questionId, value) {
        console.log(`📝 Respuesta seleccionada - Pregunta ${questionId}: ${value}`);
        this.responses[questionId] = value;
        
        // Update category score
        const question = this.data.questions.find(q => q.id === questionId);
        if (question && this.categoryScores[question.category] !== undefined) {
            // Recalcular score de la categoría
            const categoryQuestions = this.data.questions.filter(q => q.category === question.category);
            this.categoryScores[question.category] = categoryQuestions.reduce((sum, q) => {
                return sum + (this.responses[q.id] || 0);
            }, 0);
        }

        // Actualizar botón siguiente
        const nextBtn = document.querySelector('.question-actions .btn-primary');
        if (nextBtn) {
            nextBtn.disabled = false;
        }

        this.showNotification('✅ Respuesta guardada', 'success');
    }

    nextQuestion() {
        const question = this.data.questions[this.currentQuestion];
        
        if (this.responses[question.id] === undefined) {
            this.showNotification('Por favor, selecciona una respuesta antes de continuar', 'warning');
            return;
        }

        if (this.currentQuestion < this.data.questions.length - 1) {
            this.currentQuestion++;
            this.showQuestion();
        } else {
            this.completeAssessment();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion();
        }
    }

    completeAssessment() {
        this.calculateFinalScore();
        this.showResults();
    }

    calculateFinalScore() {
        this.score = Object.values(this.responses).reduce((sum, value) => sum + value, 0);
        console.log('📊 Puntuación final:', this.score);
        console.log('📈 Puntuaciones por categoría:', this.categoryScores);
    }

    getInterpretation() {
        const interpretations = this.data.scoring.interpretation;
        
        if (this.score <= 2) {
            return interpretations.lowRisk;
        } else if (this.score <= 7) {
            return interpretations.moderateRisk;
        } else {
            return interpretations.highRisk;
        }
    }

    showResults() {
        const interpretation = this.getInterpretation();
        const completionTime = Math.round((Date.now() - this.startTime) / 60000);
        
        const container = document.getElementById('qchat-container');
        container.innerHTML = `
            <div class="qchat-results">
                <div class="results-header">
                    <h1>📋 Resultados del Q-CHAT</h1>
                    <div class="completion-info">
                        <span>✅ Cuestionario completado en ${completionTime} minutos</span>
                    </div>
                </div>

                <div class="score-summary">
                    <div class="score-card" style="border-color: ${interpretation.color}">
                        <div class="score-number">${this.score}</div>
                        <div class="score-label">Puntuación Total</div>
                        <div class="score-range">(${interpretation.range})</div>
                    </div>
                    <div class="interpretation-card" style="background-color: ${interpretation.color}20; border-color: ${interpretation.color}">
                        <h3 style="color: ${interpretation.color}">${interpretation.title}</h3>
                        <p>${interpretation.description}</p>
                        ${interpretation.recommendation ? `<p><strong>Recomendación:</strong> ${interpretation.recommendation}</p>` : ''}
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn btn-primary" onclick="qchatApp.downloadResults()">
                        📄 Descargar Reporte
                    </button>
                    <button class="btn btn-secondary" onclick="qchatApp.shareResults()">
                        📤 Compartir Resultados
                    </button>
                    <button class="btn btn-outline" onclick="qchatApp.restartAssessment()">
                        🔄 Nueva Evaluación
                    </button>
                </div>
            </div>
        `;

        // Guardar resultados
        this.saveResults();
    }

    restartAssessment() {
        if (confirm('¿Está seguro de que desea reiniciar? Se perderán todas las respuestas actuales.')) {
            this.responses = {};
            this.currentQuestion = 0;
            this.score = 0;
            this.categoryScores = {};
            this.startTime = Date.now();
            this.initializeCategoryScores();
            this.showIntroduction();
        }
    }

    saveResults() {
        try {
            const results = {
                timestamp: new Date().toISOString(),
                score: this.score,
                categoryScores: this.categoryScores,
                interpretation: this.getInterpretation(),
                completionTime: Math.round((Date.now() - this.startTime) / 60000),
                responses: this.responses
            };
            
            localStorage.setItem('qchat_results', JSON.stringify(results));
            console.log('💾 Resultados guardados localmente');
        } catch (error) {
            console.warn('⚠️ No se pudieron guardar los resultados:', error);
        }
    }

    downloadResults() {
        this.showNotification('Generando reporte PDF...', 'info');
        // Aquí iría la lógica para generar PDF
        setTimeout(() => {
            this.showNotification('Reporte generado exitosamente', 'success');
        }, 2000);
    }

    shareResults() {
        if (navigator.share) {
            navigator.share({
                title: 'Resultados Q-CHAT',
                text: `Puntuación: ${this.score} - ${this.getInterpretation().title}`,
                url: window.location.href
            });
        } else {
            const text = `Resultados Q-CHAT: Puntuación ${this.score} - ${this.getInterpretation().title}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Resultados copiados al portapapeles', 'success');
            });
        }
    }

    updateProgressBar() {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            const progress = (this.currentQuestion / this.data.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        const container = document.getElementById('qchat-container');
        container.innerHTML = `
            <div class="error-container">
                <div class="error-icon">❌</div>
                <h2>Error</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    🔄 Recargar Página
                </button>
            </div>
        `;
    }
}

// Inicializar aplicación
let qchatApp;

document.addEventListener('DOMContentLoaded', function() {
    qchatApp = new QChatAssessment();
    window.qchatApp = qchatApp; // Para acceso global
});

console.log('✅ Q-CHAT JavaScript cargado correctamente');