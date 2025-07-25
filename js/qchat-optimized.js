// 📋 Q-CHAT - JavaScript Optimizado
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
            // En un entorno real, cargarías desde un archivo JSON
            // const response = await fetch('./data/qchat-data.json');
            // this.data = await response.json();
            
            // Para este ejemplo, simularemos la carga de datos
            this.data = await this.getQChatData();
            console.log('📊 Datos del Q-CHAT cargados:', this.data.metadata);
        } catch (error) {
            throw new Error('No se pudieron cargar los datos del cuestionario');
        }
    }

    // Método que simula la carga de datos (en producción vendría del JSON)
    async getQChatData() {
        // Aquí irían los datos del JSON que creamos anteriormente
        // Por simplicidad, devolvemos una versión reducida para demostrar la funcionalidad
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    metadata: {
                        title: "Q-CHAT (Quantitative Checklist for Autism in Toddlers)",
                        totalQuestions: 25,
                        scoringThreshold: 3
                    },
                    questions: [], // Se cargarían del JSON completo
                    scoring: {
                        interpretation: {
                            lowRisk: { range: "0-2", title: "Bajo Riesgo", color: "#48bb78" },
                            moderateRisk: { range: "3-7", title: "Riesgo Moderado", color: "#ed8936" },
                            highRisk: { range: "8+", title: "Alto Riesgo", color: "#e53e3e" }
                        }
                    }
                });
            }, 500);
        });
    }

    setupEventListeners() {
        // Navegación
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="next"]')) {
                this.nextQuestion();
            }
            if (e.target.matches('[data-action="previous"]')) {
                this.previousQuestion();
            }
            if (e.target.matches('[data-action="restart"]')) {
                this.restartAssessment();
            }
            if (e.target.matches('[data-action="complete"]')) {
                this.completeAssessment();
            }
        });

        // Selección de respuestas
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name="response"]')) {
                this.handleResponse(e.target);
            }
        });

        // Navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('input[name="response"]')) {
                this.nextQuestion();
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                this.previousQuestion();
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                this.nextQuestion();
            }
        });
    }

    initializeAssessment() {
        this.showIntroduction();
        this.updateProgressBar();
        this.initializeCategoryScores();
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
                                <span>5-7 minutos</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">❓</span>
                            <div>
                                <strong>Preguntas:</strong>
                                <span>${this.data.metadata.totalQuestions} preguntas</span>
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
                                Este cuestionario es solo una herramienta de detección. 
                                Los resultados no constituyen un diagnóstico médico. 
                                Consulte con un profesional de la salud si tiene preocupaciones.
                            </div>
                        </div>
                    </div>
                </div>

                <div class="intro-actions">
                    <button class="btn btn-primary btn-large" onclick="qchatApp.startAssessment()">
                        🚀 Comenzar Cuestionario
                    </button>
                </div>
            </div>
        `;
    }

    startAssessment() {
        this.currentQuestion = 0;
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestion >= this.data.questions.length) {
            this.showResults();
            return;
        }

        const question = this.data.questions[this.currentQuestion];
        const container = document.getElementById('qchat-container');
        
        container.innerHTML = `
            <div class="qchat-question">
                <div class="question-header">
                    <div class="question-number">
                        Pregunta ${this.currentQuestion + 1} de ${this.data.questions.length}
                    </div>
                    <div class="question-category">
                        ${this.getCategoryName(question.category)}
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentQuestion / this.data.questions.length) * 100}%"></div>
                    </div>
                    <div class="progress-text">
                        ${Math.round((this.currentQuestion / this.data.questions.length) * 100)}% completado
                    </div>
                </div>

                <div class="question-content">
                    <h2 class="question-text">${question.text}</h2>
                    
                    <div class="question-options">
                        ${question.options.map((option, index) => `
                            <label class="option-label">
                                <input 
                                    type="radio" 
                                    name="response" 
                                    value="${option.value}"
                                    data-text="${option.text}"
                                    ${this.responses[question.id] === option.value ? 'checked' : ''}
                                >
                                <div class="option-content">
                                    <div class="option-text">${option.text}</div>
                                    ${option.description ? `<div class="option-description">${option.description}</div>` : ''}
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="question-actions">
                    <button 
                        class="btn btn-secondary" 
                        data-action="previous"
                        ${this.currentQuestion === 0 ? 'disabled' : ''}
                    >
                        ← Anterior
                    </button>
                    
                    <button 
                        class="btn btn-primary" 
                        data-action="next"
                        ${!this.responses[question.id] ? 'disabled' : ''}
                    >
                        ${this.currentQuestion === this.data.questions.length - 1 ? 'Finalizar' : 'Siguiente →'}
                    </button>
                </div>
            </div>
        `;

        // Scroll to top
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Focus on first option for accessibility
        setTimeout(() => {
            const firstOption = container.querySelector('input[name="response"]');
            if (firstOption && !this.responses[question.id]) {
                firstOption.focus();
            }
        }, 100);
    }

    handleResponse(input) {
        const question = this.data.questions[this.currentQuestion];
        const value = parseInt(input.value);
        const text = input.getAttribute('data-text');
        
        // Guardar respuesta
        this.responses[question.id] = value;
        
        // Actualizar puntuación de categoría
        this.updateCategoryScore(question.category, value);
        
        // Habilitar botón siguiente
        const nextBtn = document.querySelector('[data-action="next"]');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
        
        // Feedback visual
        input.closest('label').classList.add('selected');
        
        // Feedback de voz (opcional)
        this.speakText(`Seleccionado: ${text}`);
        
        console.log(`Respuesta registrada - Pregunta ${question.id}: ${value} (${text})`);
    }

    updateCategoryScore(category, points) {
        if (this.categoryScores[category] !== undefined) {
            this.categoryScores[category] += points;
        }
    }

    nextQuestion() {
        const question = this.data.questions[this.currentQuestion];
        
        if (!this.responses[question.id] && this.responses[question.id] !== 0) {
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
                        <div class="score-range">(Rango: ${interpretation.range})</div>
                    </div>
                    
                    <div class="interpretation-card" style="background-color: ${interpretation.color}20; border-color: ${interpretation.color}">
                        <h3 style="color: ${interpretation.color}">${interpretation.title}</h3>
                        <p>${interpretation.description}</p>
                    </div>
                </div>

                <div class="category-breakdown">
                    <h3>📊 Desglose por Categorías</h3>
                    <div class="category-scores">
                        ${Object.entries(this.categoryScores).map(([category, score]) => {
                            const categoryInfo = this.data.scoring.categories[category];
                            return `
                                <div class="category-item">
                                    <div class="category-name">${categoryInfo?.name || category}</div>
                                    <div class="category-score">${score} puntos</div>
                                    <div class="category-description">${categoryInfo?.description || ''}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="recommendations">
                    <h3>💡 Recomendaciones</h3>
                    <div class="recommendation-content">
                        <p>${interpretation.recommendation}</p>
                        
                        ${this.score >= 3 ? `
                            <div class="next-steps">
                                <h4>Próximos Pasos Sugeridos:</h4>
                                <ul>
                                    <li>Programar cita con pediatra del desarrollo</li>
                                    <li>Documentar comportamientos específicos observados</li>
                                    <li>Recopilar videos de interacciones sociales</li>
                                    <li>Contactar servicios de intervención temprana locales</li>
                                </ul>
                            </div>
                        ` : `
                            <div class="monitoring-tips">
                                <h4>Seguimiento Recomendado:</h4>
                                <ul>
                                    <li>Continuar con visitas regulares al pediatra</li>
                                    <li>Fomentar el desarrollo a través del juego</li>
                                    <li>Mantener interacciones sociales frecuentes</li>
                                    <li>Repetir evaluación en 6 meses</li>
                                </ul>
                            </div>
                        `}
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn btn-primary" onclick="qchatApp.generateReport()">
                        📄 Generar Reporte PDF
                    </button>
                    <button class="btn btn-secondary" onclick="qchatApp.restartAssessment()">
                        🔄 Realizar Nuevamente
                    </button>
                    <button class="btn btn-accent" onclick="qchatApp.shareResults()">
                        📤 Compartir Resultados
                    </button>
                </div>

                <div class="disclaimer-results">
                    <div class="disclaimer-box">
                        <span class="disclaimer-icon">⚠️</span>
                        <div>
                            <strong>Recordatorio:</strong>
                            Estos resultados son solo orientativos. Para un diagnóstico 
                            preciso, consulte con un profesional especializado en desarrollo infantil.
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Scroll to results
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Save results locally
        this.saveResults();
    }

    getInterpretation() {
        const scoring = this.data.scoring.interpretation;
        
        if (this.score <= 2) {
            return scoring.lowRisk;
        } else if (this.score <= 7) {
            return scoring.moderateRisk;
        } else {
            return scoring.highRisk;
        }
    }

    getCategoryName(category) {
        const categories = {
            social: 'Interacción Social',
            communication: 'Comunicación',
            play: 'Juego',
            behavioral: 'Comportamiento',
            sensory: 'Procesamiento Sensorial'
        };
        return categories[category] || category;
    }

    restartAssessment() {
        if (confirm('¿Está seguro de que desea reiniciar el cuestionario? Se perderán todas las respuestas actuales.')) {
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

    generateReport() {
        this.showNotification('Generando reporte PDF...', 'info');
        
        // Simular generación de PDF
        setTimeout(() => {
            this.showNotification('Reporte generado exitosamente', 'success');
            console.log('📄 Reporte PDF generado');
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
            // Fallback para navegadores sin soporte
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

    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            utterance.volume = 0.7;
            speechSynthesis.speak(utterance);
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
                document.body.removeChild(notification);
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
});

// Funciones globales para compatibilidad
window.qchatApp = null;

// Event listener para cuando la aplicación esté lista
document.addEventListener('DOMContentLoaded', function() {
    window.qchatApp = qchatApp;
});

console.log('✅ Q-CHAT JavaScript cargado correctamente');