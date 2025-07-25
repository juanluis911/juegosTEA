// 📋 Q-CHAT - JavaScript Optimizado v2.0
// Sistema de evaluación para múltiples rangos de edad
console.log('📋 Iniciando Q-CHAT v2.0...');

class QChatAssessment {
    constructor() {
        this.data = null;
        this.responses = {};
        this.currentQuestion = 0;
        this.selectedAgeGroup = null;
        this.currentQuestions = [];
        this.score = 0;
        this.categoryScores = {};
        this.startTime = null;
        this.demographicData = {};
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.showAgeSelection();
            console.log('✅ Q-CHAT v2.0 inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Q-CHAT:', error);
            this.showError('Error cargando el cuestionario. Por favor, recarga la página.');
        }
    }

    async loadData() {
        try {
            // En producción, esto cargaría desde el archivo JSON
            // const response = await fetch('./data/qchat-data.json');
            // this.data = await response.json();
            
            // Para desarrollo, simulamos la carga de datos
            this.data = await this.getQChatData();
            console.log('📊 Datos del Q-CHAT cargados:', this.data.metadata);
        } catch (error) {
            throw new Error('No se pudieron cargar los datos del cuestionario');
        }
    }

    // Simulación de carga de datos (en producción vendría del JSON)
    async getQChatData() {
        return new Promise(resolve => {
            setTimeout(() => {
                // Aquí iría la estructura completa del JSON
                resolve({
                    metadata: {
                        version: "2.0",
                        title: "Q-CHAT - Cuestionario de Detección del Autismo"
                    },
                    ageGroups: {
                        toddlers: {
                            name: "Niños Pequeños",
                            ageRange: "2-6 años",
                            totalQuestions: 25
                        },
                        children: {
                            name: "Niños Escolares", 
                            ageRange: "7-11 años",
                            totalQuestions: 30
                        },
                        adolescents: {
                            name: "Adolescentes",
                            ageRange: "12-17 años", 
                            totalQuestions: 35
                        }
                    },
                    questions: {
                        toddlers: [],
                        children: [],
                        adolescents: []
                    }
                });
            }, 1000);
        });
    }

    setupEventListeners() {
        // Gestión de eventos globales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentQuestion > 0) {
                this.previousQuestion();
            } else if (e.key === 'ArrowRight' && this.canProceed()) {
                this.nextQuestion();
            }
        });
    }

    showAgeSelection() {
        const container = document.getElementById('qchat-container');
        if (!container) return;

        container.innerHTML = `
            <div class="age-selection">
                <div class="age-header">
                    <h1>📋 Q-CHAT - Selección de Edad</h1>
                    <p class="age-subtitle">Seleccione el rango de edad de su hijo/a para acceder al cuestionario apropiado</p>
                </div>
                
                <div class="age-options">
                    <div class="age-card" data-age-group="toddlers">
                        <div class="age-icon">👶</div>
                        <h3>Niños Pequeños</h3>
                        <p class="age-range">2 - 6 años</p>
                        <p class="age-description">Cuestionario adaptado para la primera infancia</p>
                        <div class="age-details">
                            <span class="detail-item">⏱️ 5-7 minutos</span>
                            <span class="detail-item">❓ 25 preguntas</span>
                        </div>
                    </div>
                    
                    <div class="age-card" data-age-group="children">
                        <div class="age-icon">🧒</div>
                        <h3>Niños Escolares</h3>
                        <p class="age-range">7 - 11 años</p>
                        <p class="age-description">Cuestionario para edad escolar temprana</p>
                        <div class="age-details">
                            <span class="detail-item">⏱️ 8-10 minutos</span>
                            <span class="detail-item">❓ 30 preguntas</span>
                        </div>
                    </div>
                    
                    <div class="age-card" data-age-group="adolescents">
                        <div class="age-icon">👦</div>
                        <h3>Adolescentes</h3>
                        <p class="age-range">12 - 17 años</p>
                        <p class="age-description">Cuestionario adaptado para adolescentes</p>
                        <div class="age-details">
                            <span class="detail-item">⏱️ 10-12 minutos</span>
                            <span class="detail-item">❓ 35 preguntas</span>
                        </div>
                    </div>
                </div>
                
                <div class="important-notice">
                    <div class="notice-icon">⚠️</div>
                    <div class="notice-content">
                        <h4>Importante</h4>
                        <p>Este cuestionario es una herramienta de detección, no un diagnóstico. 
                        Los resultados deben ser interpretados por un profesional de la salud.</p>
                    </div>
                </div>
            </div>
        `;

        // Agregar event listeners para la selección de edad
        const ageCards = container.querySelectorAll('.age-card');
        ageCards.forEach(card => {
            card.addEventListener('click', () => {
                const ageGroup = card.dataset.ageGroup;
                this.selectAgeGroup(ageGroup);
            });

            // Accesibilidad con teclado
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const ageGroup = card.dataset.ageGroup;
                    this.selectAgeGroup(ageGroup);
                }
            });
        });
    }

    selectAgeGroup(ageGroupId) {
        this.selectedAgeGroup = ageGroupId;
        this.currentQuestions = this.data.questions[ageGroupId] || [];
        this.showDemographicForm();
    }

    showDemographicForm() {
        const container = document.getElementById('qchat-container');
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];

        container.innerHTML = `
            <div class="demographic-form">
                <div class="demo-header">
                    <h1>📋 Q-CHAT - ${ageGroupData.name}</h1>
                    <p class="demo-subtitle">Información básica antes de comenzar</p>
                    <div class="selected-age">
                        <span class="age-badge">${ageGroupData.ageRange}</span>
                    </div>
                </div>
                
                <form class="demo-form" id="demographicForm">
                    <div class="form-group">
                        <label for="childAge">Edad específica de su hijo/a (en meses)</label>
                        <input type="number" id="childAge" min="${ageGroupData.minAge || 24}" 
                               max="${ageGroupData.maxAge || 204}" required>
                        <span class="form-help">Ejemplo: 36 meses para 3 años</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="parentRelation">Su relación con el niño/a</label>
                        <select id="parentRelation" required>
                            <option value="">Seleccione una opción</option>
                            <option value="mother">Madre</option>
                            <option value="father">Padre</option>
                            <option value="guardian">Tutor/a legal</option>
                            <option value="relative">Familiar cercano</option>
                            <option value="caregiver">Cuidador/a</option>
                            <option value="professional">Profesional (educador, terapeuta, etc.)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="previousConcerns">¿Ha tenido preocupaciones previas sobre el desarrollo?</label>
                        <select id="previousConcerns">
                            <option value="">Seleccione una opción</option>
                            <option value="none">Ninguna preocupación</option>
                            <option value="mild">Algunas preocupaciones menores</option>
                            <option value="moderate">Preocupaciones moderadas</option>
                            <option value="high">Preocupaciones significativas</option>
                        </select>
                    </div>
                    
                    <div class="privacy-notice">
                        <div class="privacy-icon">🔒</div>
                        <p>Sus respuestas son completamente anónimas y no se almacenan datos personales.</p>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        Comenzar Cuestionario →
                    </button>
                </form>
            </div>
        `;

        // Manejar envío del formulario
        const form = document.getElementById('demographicForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processDemographicData(new FormData(form));
        });
    }

    processDemographicData(formData) {
        this.demographicData = {
            childAge: parseInt(formData.get('childAge')),
            parentRelation: formData.get('parentRelation'),
            previousConcerns: formData.get('previousConcerns'),
            startTime: new Date().toISOString()
        };

        // Validar edad según el grupo seleccionado
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];
        const childAgeMonths = this.demographicData.childAge;
        
        if (childAgeMonths < (ageGroupData.minAge || 0) || 
            childAgeMonths > (ageGroupData.maxAge || 240)) {
            this.showNotification(
                `La edad ingresada (${childAgeMonths} meses) no corresponde al rango seleccionado (${ageGroupData.ageRange}). ¿Desea continuar de todos modos?`,
                'warning'
            );
        }

        this.startTime = Date.now();
        this.currentQuestion = 0;
        this.responses = {};
        this.showIntroduction();
    }

    showIntroduction() {
        const container = document.getElementById('qchat-container');
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];

        container.innerHTML = `
            <div class="qchat-introduction">
                <div class="intro-header">
                    <h1>📋 Q-CHAT - ${ageGroupData.name}</h1>
                    <p class="intro-subtitle">Cuestionario para ${ageGroupData.ageRange}</p>
                </div>
                
                <div class="intro-content">
                                            <div class="intro-info">
                        <div class="info-item">
                            <span class="info-icon">⏱️</span>
                            <div>
                                <strong>Tiempo estimado:</strong><br>
                                <span>${ageGroupData.completionTime || '5-10 minutos'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">❓</span>
                            <div>
                                <strong>Preguntas:</strong><br>
                                <span>${ageGroupData.totalQuestions} preguntas</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">👶</span>
                            <div>
                                <strong>Edad del niño/a:</strong><br>
                                <span>${this.demographicData.childAge} meses</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🔒</span>
                            <div>
                                <strong>Privacidad:</strong><br>
                                <span>Respuestas anónimas</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="guidelines-box">
                        <h3>📋 Instrucciones</h3>
                        <ul class="guidelines-list">
                            <li>Responda basándose en el comportamiento típico de su hijo/a</li>
                            <li>Si no está seguro/a, seleccione la opción más cercana</li>
                            <li>No hay respuestas correctas o incorrectas</li>
                            <li>Puede navegar entre preguntas usando los botones</li>
                            <li>Sus respuestas se guardan automáticamente</li>
                        </ul>
                    </div>
                    
                    <div class="disclaimer-box">
                        <span class="disclaimer-icon">⚠️</span>
                        <div>
                            <strong>Importante:</strong> 
                            Este cuestionario es una herramienta de detección, no un diagnóstico médico. 
                            Los resultados deben ser interpretados por un profesional de la salud.
                        </div>
                    </div>
                    
                    <div class="intro-actions">
                        <button class="btn btn-secondary" onclick="qchat.showAgeSelection()">
                            ← Cambiar Edad
                        </button>
                        <button class="btn btn-primary" onclick="qchat.startAssessment()">
                            Comenzar Cuestionario →
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    startAssessment() {
        if (this.currentQuestions.length === 0) {
            this.showError('No hay preguntas disponibles para este grupo de edad');
            return;
        }
        
        this.currentQuestion = 0;
        this.responses = {};
        this.score = 0;
        this.categoryScores = {};
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestion >= this.currentQuestions.length) {
            this.showResults();
            return;
        }

        const question = this.currentQuestions[this.currentQuestion];
        const container = document.getElementById('qchat-container');
        const progress = ((this.currentQuestion + 1) / this.currentQuestions.length) * 100;

        container.innerHTML = `
            <div class="qchat-question">
                <div class="question-header">
                    <div class="progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">
                            Pregunta ${this.currentQuestion + 1} de ${this.currentQuestions.length}
                        </span>
                    </div>
                    
                    <div class="question-category">
                        <span class="category-badge category-${question.category}">
                            ${this.getCategoryName(question.category)}
                        </span>
                    </div>
                </div>
                
                <div class="question-content">
                    <h2 class="question-text">${question.text}</h2>
                    
                    <div class="options-container" role="radiogroup" 
                         aria-labelledby="question-text" aria-required="true">
                        ${question.options.map((option, index) => `
                            <label class="option-label" for="option-${index}">
                                <input type="radio" 
                                       id="option-${index}" 
                                       name="question-${question.id}" 
                                       value="${option.value}"
                                       data-text="${option.text}"
                                       ${this.responses[question.id] === option.value ? 'checked' : ''}>
                                <span class="option-content">
                                    <span class="option-text">${option.text}</span>
                                    ${option.description ? `<span class="option-description">${option.description}</span>` : ''}
                                </span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="question-actions">
                    <button class="btn btn-secondary" 
                            onclick="qchat.previousQuestion()" 
                            ${this.currentQuestion === 0 ? 'disabled' : ''}>
                        ← Anterior
                    </button>
                    
                    <div class="action-info">
                        <span class="keyboard-hint">Use ← → para navegar</span>
                    </div>
                    
                    <button class="btn btn-primary" 
                            onclick="qchat.nextQuestion()" 
                            id="nextButton"
                            ${!this.responses.hasOwnProperty(question.id) ? 'disabled' : ''}>
                        ${this.currentQuestion === this.currentQuestions.length - 1 ? 'Finalizar' : 'Siguiente →'}
                    </button>
                </div>
            </div>
        `;

        // Agregar event listeners para las opciones
        const radioButtons = container.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                this.selectOption(question.id, parseInt(radio.value), radio.dataset.text);
            });
        });

        // Focus en la primera opción no seleccionada
        const firstRadio = container.querySelector('input[type="radio"]');
        if (firstRadio) {
            firstRadio.focus();
        }
    }

    selectOption(questionId, value, text) {
        this.responses[questionId] = value;
        
        // Actualizar botón siguiente
        const nextButton = document.getElementById('nextButton');
        if (nextButton) {
            nextButton.disabled = false;
        }
        
        // Auto-avanzar después de selección (opcional)
        setTimeout(() => {
            if (this.currentQuestion < this.currentQuestions.length - 1) {
                // this.nextQuestion(); // Descomenta para auto-avanzar
            }
        }, 500);
        
        this.showNotification(`Respuesta guardada: ${text}`, 'success');
    }

    nextQuestion() {
        const currentQ = this.currentQuestions[this.currentQuestion];
        if (!this.responses.hasOwnProperty(currentQ.id)) {
            this.showNotification('Por favor, seleccione una respuesta antes de continuar', 'warning');
            return;
        }
        
        this.currentQuestion++;
        this.showQuestion();
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion();
        }
    }

    calculateScore() {
        this.score = 0;
        this.categoryScores = {};
        
        // Inicializar categorías
        const categories = ['social', 'communication', 'play', 'behavioral', 'sensory', 'cognitive'];
        categories.forEach(cat => {
            this.categoryScores[cat] = { score: 0, total: 0 };
        });
        
        // Calcular puntuaciones
        this.currentQuestions.forEach(question => {
            const response = this.responses[question.id];
            if (response !== undefined) {
                this.score += response;
                
                if (this.categoryScores[question.category]) {
                    this.categoryScores[question.category].score += response;
                    this.categoryScores[question.category].total += 1;
                }
            }
        });
    }

    getInterpretation() {
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];
        const thresholds = ageGroupData.scoringThreshold;
        
        if (this.score <= thresholds.lowRisk.max) {
            return 'lowRisk';
        } else if (this.score <= thresholds.moderateRisk.max) {
            return 'moderateRisk';
        } else {
            return 'highRisk';
        }
    }

    showResults() {
        this.calculateScore();
        const interpretation = this.getInterpretation();
        const interpretationData = this.data.scoring?.interpretation?.[interpretation] || {
            title: 'Resultado',
            description: 'Resultado calculado',
            color: '#718096'
        };
        
        const completionTime = Math.round((Date.now() - this.startTime) / 1000);
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];

        const container = document.getElementById('qchat-container');
        container.innerHTML = `
            <div class="qchat-results">
                <div class="results-header">
                    <h1>📋 Resultados del Q-CHAT</h1>
                    <div class="completion-info">
                        <span>✅ Cuestionario completado</span>
                        <span>⏱️ Tiempo: ${Math.floor(completionTime/60)}:${(completionTime%60).toString().padStart(2,'0')}</span>
                        <span>👶 Edad: ${this.demographicData.childAge} meses</span>
                    </div>
                </div>
                
                <div class="score-summary">
                    <div class="score-card" style="border-color: ${interpretationData.color}">
                        <div class="score-number">${this.score}</div>
                        <div class="score-label">Puntuación Total</div>
                        <div class="score-range">(Rango: 0-${ageGroupData.totalQuestions})</div>
                    </div>
                    
                    <div class="interpretation-card" 
                         style="background-color: ${interpretationData.color}20; border-color: ${interpretationData.color}">
                        <h3 style="color: ${interpretationData.color}">
                            ${interpretationData.icon || '📊'} ${interpretationData.title}
                        </h3>
                        <p>${interpretationData.description}</p>
                    </div>
                </div>
                
                <div class="category-breakdown">
                    <h3>📊 Análisis por Categorías</h3>
                    <div class="categories-grid">
                        ${Object.entries(this.categoryScores).map(([category, data]) => {
                            const percentage = data.total > 0 ? (data.score / data.total * 100) : 0;
                            return `
                                <div class="category-card">
                                    <div class="category-header">
                                        <span class="category-name">${this.getCategoryName(category)}</span>
                                        <span class="category-score">${data.score}/${data.total}</span>
                                    </div>
                                    <div class="category-bar">
                                        <div class="category-fill" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="recommendations">
                    <h3>💡 Recomendaciones</h3>
                    <div class="recommendation-content">
                        ${interpretationData.recommendations ? `
                            <ul class="recommendations-list">
                                ${interpretationData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        ` : '<p>Consulte con un profesional de la salud para obtener orientación específica.</p>'}
                    </div>
                </div>
                
                <div class="important-disclaimer">
                    <div class="disclaimer-icon">⚠️</div>
                    <div class="disclaimer-content">
                        <h4>Descargo de Responsabilidad</h4>
                        <p>Este cuestionario es únicamente una herramienta de detección. Los resultados no constituyen un diagnóstico médico y deben ser interpretados por un profesional de la salud calificado.</p>
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-secondary" onclick="qchat.restartAssessment()">
                        🔄 Realizar Otro Cuestionario
                    </button>
                    <button class="btn btn-primary" onclick="qchat.printResults()">
                        🖨️ Guardar/Imprimir Resultados
                    </button>
                </div>
            </div>
        `;
    }

    getCategoryName(category) {
        const categoryNames = {
            social: 'Interacción Social',
            communication: 'Comunicación',
            play: 'Juego',
            behavioral: 'Comportamiento',
            sensory: 'Procesamiento Sensorial',
            cognitive: 'Habilidades Cognitivas'
        };
        return categoryNames[category] || category;
    }

    restartAssessment() {
        if (confirm('¿Está seguro de que desea realizar otro cuestionario? Se perderán los resultados actuales.')) {
            this.responses = {};
            this.currentQuestion = 0;
            this.score = 0;
            this.categoryScores = {};
            this.selectedAgeGroup = null;
            this.demographicData = {};
            this.showAgeSelection();
        }
    }

    printResults() {
        window.print();
    }

    handleEscape() {
        // Manejar tecla Escape según el contexto
        if (this.currentQuestion >= 0 && this.currentQuestion < this.currentQuestions.length) {
            if (confirm('¿Desea salir del cuestionario? Se perderá el progreso actual.')) {
                this.showAgeSelection();
            }
        }
    }

    canProceed() {
        if (this.currentQuestion >= this.currentQuestions.length) return false;
        const currentQ = this.currentQuestions[this.currentQuestion];
        return this.responses.hasOwnProperty(currentQ.id);
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

    showNotification(message, type = 'info') {
        // Remover notificaciones existentes
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
let qchat;
document.addEventListener('DOMContentLoaded', () => {
    qchat = new QChatAssessment();
});

// Exportar para uso global
window.qchat = qchat;