{
            id: 20,
            text: "¿Su hijo/a busca apoyo emocional de manera apropiada?",
            help: "Evalúe si pide ayuda emocional cuando enfrenta desafíos.",
            domain: "social",
            scoring: "reverse"
        }
    ],

    "15-18": [
        {
            id: 1,
            text: "¿Su hijo/a mantiene relaciones de amistad recíprocas y significativas?",
            help: "Evalúe la profundidad y reciprocidad en las relaciones interpersonales.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 2,
            text: "¿Su hijo/a comprende las sutilezas sociales y comunicativas?",
            help: "Observe habilidad para interpretar comunicación indirecta y contextos sociales complejos.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 3,
            text: "¿Su hijo/a puede interpretar emociones complejas en otros?",
            help: "Considere capacidad para reconocer estados emocionales sutiles en otros.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 4,
            text: "¿Su hijo/a tiene intereses especiales que interfieren con responsabilidades?",
            help: "Fíjese si los intereses intensos afectan tareas académicas o sociales.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 5,
            text: "¿Su hijo/a adapta su comunicación a diferentes audiencias?",
            help: "Observe flexibilidad comunicativa con autoridades, pares, y diferentes contextos.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 6,
            text: "¿Su hijo/a comprende el humor sarcástico y referencias culturales?",
            help: "Evalúe entendimiento de humor complejo y referencias compartidas.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 7,
            text: "¿Su hijo/a maneja bien la incertidumbre y cambios de planes?",
            help: "Considere adaptabilidad ante situaciones imprevistas.",
            domain: "flexibility",
            scoring: "reverse"
        },
        {
            id: 8,
            text: "¿Su hijo/a busca independencia y autonomía apropiada?",
            help: "Observe desarrollo de habilidades de vida independiente.",
            domain: "development",
            scoring: "reverse"
        },
        {
            id: 9,
            text: "¿Su hijo/a tiene rutinas rígidas que no puede alterar?",
            help: "Fíjese en inflexibilidad extrema hacia cambios en rutinas establecidas.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 10,
            text: "¿Su hijo/a regula emociones de manera apropiada para su edad?",
            help: "Evalúe control emocional y estrategias de afrontamiento.",
            domain: "regulation",
            scoring: "reverse"
        },
        {
            id: 11,
            text: "¿Su hijo/a participa en actividades sociales grupales voluntariamente?",
            help: "Observe motivación intrínseca para participar en eventos sociales.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 12,
            text: "¿Su hijo/a tiene sensibilidades sensoriales que limitan actividades?",
            help: "Considere impacto de sensibilidades en vida académica, social y laboral.",
            domain: "sensory",
            scoring: "direct"
        },
        {
            id: 13,
            text: "¿Su hijo/a demuestra teoría de la mente avanzada?",
            help: "Fíjese en capacidad para entender perspectivas complejas de otros.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 14,
            text: "¿Su hijo/a tiene dificultades significativas con autorregulación?",
            help: "Observe control de impulsos y gestión de estrés.",
            domain: "regulation",
            scoring: "direct"
        },
        {
            id: 15,
            text: "¿Su hijo/a inicia y mantiene relaciones románticas apropiadas?",
            help: "Evalúe habilidades para relaciones íntimas apropiadas para la edad.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 16,
            text: "¿Su hijo/a comprende límites sociales en diferentes contextos?",
            help: "Observe entendimiento de normas sociales en contextos variados.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 17,
            text: "¿Su hijo/a presenta comportamientos repetitivos o ritualizados?",
            help: "Fíjese en estereotipias o rutinas que persisten en la adolescencia.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 18,
            text: "¿Su hijo/a planifica efectivamente para el futuro?",
            help: "Considere habilidades de planificación a largo plazo y toma de decisiones.",
            domain: "executive",
            scoring: "reverse"
        },
        {
            id: 19,
            text: "¿Su hijo/a demuestra flexibilidad cognitiva en situaciones complejas?",
            help: "Observe adaptabilidad mental ante desafíos multifacéticos.",
            domain: "flexibility",
            scoring: "reverse"
        },
        {
            id: 20,
            text: "¿Su hijo/a busca y acepta apoyo emocional apropiadamente?",
            help: "Evalúe capacidad para solicitar y recibir apoyo emocional cuando es necesario.",
            domain: "social",
            scoring: "reverse"
        }
    ]
};

// Opciones de respuesta (sin cambios)
const answerOptions = [
    { value: 1, text: "Nunca", description: "No ocurre en absoluto" },
    { value: 2, text: "Raramente", description: "Ocurre muy pocas veces" },
    { value: 3, text: "A veces", description: "Ocurre ocasionalmente" },
    { value: 4, text: "Con frecuencia", description: "Ocurre regularmente" },
    { value: 5, text: "Siempre", description: "Ocurre constantemente" }
];

// === ESTADO DEL QUIZ ===
const quizState = {
    currentQuestion: 0,
    answers: {},
    childInfo: {},
    startTime: null,
    endTime: null,
    currentQuestions: [],
    showingResults: false
};

// === FUNCIONES DE NAVEGACIÓN ===

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function updateAgeOptions() {
    const ageGroup = document.getElementById('childAgeGroup').value;
    const specificAgeSelect = document.getElementById('childSpecificAge');
    const specificAgeGroup = document.getElementById('specificAgeGroup');
    
    // Limpiar opciones anteriores
    specificAgeSelect.innerHTML = '<option value="">Seleccionar edad específica...</option>';
    
    if (ageGroup) {
        specificAgeGroup.style.display = 'block';
        
        // Agregar opciones específicas según el grupo
        const ageRanges = {
            "0-2": ["6 meses", "12 meses", "18 meses", "24 meses"],
            "3-6": ["3 años", "4 años", "5 años", "6 años"],
            "6-10": ["6 años", "7 años", "8 años", "9 años", "10 años"],
            "11-14": ["11 años", "12 años", "13 años", "14 años"],
            "15-18": ["15 años", "16 años", "17 años", "18 años"]
        };
        
        ageRanges[ageGroup].forEach(age => {
            const option = document.createElement('option');
            option.value = age;
            option.textContent = age;
            specificAgeSelect.appendChild(option);
        });
    } else {
        specificAgeGroup.style.display = 'none';
    }
}

function startQuiz() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showSection('ageSection');
    }, 1000);
}

function showIntro() {
    showSection('introSection');
}

function validateAndStartQuestions() {
    const ageGroup = document.getElementById('childAgeGroup').value;
    const specificAge = document.getElementById('childSpecificAge').value;
    const relationship = document.getElementById('relationship').value;

    if (!ageGroup || !specificAge || !relationship) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    proceedToQuestions();
}

function proceedToQuestions() {
    // Guardar información del niño
    quizState.childInfo = {
        ageGroup: document.getElementById('childAgeGroup').value,
        specificAge: document.getElementById('childSpecificAge').value,
        gender: document.getElementById('childGender').value,
        previousConcerns: document.getElementById('previousConcerns').value,
        relationship: document.getElementById('relationship').value
    };

    // Obtener preguntas apropiadas para la edad
    quizState.currentQuestions = questionsByAgeGroup[quizState.childInfo.ageGroup] || [];

    quizState.startTime = new Date();
    showSection('questionsSection');
    loadQuestion(0);
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = ['introSection', 'ageSection', 'questionsSection', 'resultsSection'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });

    // Mostrar la sección solicitada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('fade-in');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === FUNCIONES DE PREGUNTAS ===

function loadQuestion(questionIndex) {
    if (questionIndex >= quizState.currentQuestions.length) {
        calculateAndShowResults();
        return;
    }

    quizState.currentQuestion = questionIndex;
    const question = quizState.currentQuestions[questionIndex];

    // Actualizar elementos de la UI
    document.getElementById('currentQuestion').textContent = questionIndex + 1;
    document.getElementById('totalQuestions').textContent = quizState.currentQuestions.length;
    document.getElementById('questionNumber').textContent = questionIndex + 1;
    document.getElementById('questionText').textContent = question.text;
    document.getElementById('questionHelp').textContent = question.help;

    // Actualizar barra de progreso
    const progress = ((questionIndex + 1) / quizState.currentQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressPercentage').textContent = `${Math.round(progress)}%`;

    // Generar opciones de respuesta
    generateAnswerOptions(question.id);

    // Actualizar botones de navegación
    updateNavigationButtons();
}

function generateAnswerOptions(questionId) {
    const container = document.getElementById('answerOptions');
    container.innerHTML = '';

    answerOptions.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.setAttribute('data-value', option.value);
        optionElement.setAttribute('tabindex', '0');
        optionElement.setAttribute('role', 'radio');
        optionElement.setAttribute('aria-label', `${option.text}: ${option.description}`);

        // Verificar si esta opción ya está seleccionada
        if (quizState.answers[questionId] === option.value) {
            optionElement.classList.add('selected');
        }

        optionElement.innerHTML = `
            <div class="option-radio"></div>
            <div class="option-content">
                <div class="option-text">${option.text}</div>
                <div class="option-description">${option.description}</div>
            </div>
        `;

        // Event listeners
        optionElement.addEventListener('click', () => selectAnswer(questionId, option.value));
        optionElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectAnswer(questionId, option.value);
            }
        });

        container.appendChild(optionElement);
    });
}

function selectAnswer(questionId, value) {
    // Guardar respuesta
    quizState.answers[questionId] = value;

    // Actualizar UI
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (parseInt(option.getAttribute('data-value')) === value) {
            option.classList.add('selected');
        }
    });

    // Actualizar botones de navegación
    updateNavigationButtons();

    // Feedback de audio
    playSelectionSound();

    console.log(`Respuesta guardada - Pregunta ${questionId}: ${value}`);
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Botón anterior
    prevBtn.disabled = quizState.currentQuestion === 0;

    // Botón siguiente - habilitar solo si hay respuesta seleccionada
    const currentQuestionId = quizState.currentQuestions[quizState.currentQuestion].id;
    nextBtn.disabled = !quizState.answers.hasOwnProperty(currentQuestionId);

    // Cambiar texto del botón siguiente en la última pregunta
    if (quizState.currentQuestion === quizState.currentQuestions.length - 1) {
        nextBtn.innerHTML = 'Ver Resultados →';
    } else {
        nextBtn.innerHTML = 'Siguiente →';
    }
}

function previousQuestion() {
    if (quizState.currentQuestion > 0) {
        loadQuestion(quizState.currentQuestion - 1);
        playNavigationSound();
    }
}

function nextQuestion() {
    const currentQuestionId = quizState.currentQuestions[quizState.currentQuestion].id;
    
    if (!quizState.answers.hasOwnProperty(currentQuestionId)) {
        alert('Por favor, selecciona una respuesta antes de continuar.');
        return;
    }

    if (quizState.currentQuestion < quizState.currentQuestions.length - 1) {
        loadQuestion(quizState.currentQuestion + 1);
        playNavigationSound();
    } else {
        // Última pregunta - mostrar resultados
        calculateAndShowResults();
    }
}

// === CÁLCULO DE RESULTADOS ===

function calculateAndShowResults() {
    quizState.endTime = new Date();
    const duration = (quizState.endTime - quizState.startTime) / 1000; // segundos

    showLoading();

    setTimeout(() => {
        hideLoading();
        
        // Calcular puntuación total
        const results = calculateComprehensiveScore();
        
        // Mostrar resultados
        displayResults(results, duration);
        
        // Guardar resultados
        saveResults(results);
        
        showSection('resultsSection');
    }, 2000);
}

function calculateComprehensiveScore() {
    let totalScore = 0;
    const domainScores = {
        social: { total: 0, count: 0 },
        communication: { total: 0, count: 0 },
        repetitive: { total: 0, count: 0 },
        sensory: { total: 0, count: 0 },
        flexibility: { total: 0, count: 0 },
        regulation: { total: 0, count: 0 },
        play: { total: 0, count: 0 },
        executive: { total: 0, count: 0 },
        development: { total: 0, count: 0 }
    };

    // Calcular puntuación para cada pregunta
    quizState.currentQuestions.forEach(question => {
        const rawAnswer = quizState.answers[question.id];
        let score;

        // Aplicar sistema de puntuación
        if (question.scoring === 'reverse') {
            // Para preguntas de desarrollo típico: 5=siempre se convierte en 1 punto, 1=nunca se convierte en 5 puntos
            score = 6 - rawAnswer;
        } else {
            // Para preguntas de señales de alerta: mantener puntuación directa
            score = rawAnswer;
        }

        totalScore += score;

        // Acumular por dominio
        if (domainScores[question.domain]) {
            domainScores[question.domain].total += score;
            domainScores[question.domain].count += 1;
        }
    });

    // Calcular promedios por dominio
    Object.keys(domainScores).forEach(domain => {
        if (domainScores[domain].count > 0) {
            domainScores[domain].average = domainScores[domain].total / domainScores[domain].count;
        }
    });

    // Determinar nivel de riesgo y nivel de autismo
    const maxScore = quizState.currentQuestions.length * 5;
    const scorePercentage = (totalScore / maxScore) * 100;
    
    let riskLevel, interpretation, autismLevel;

    // Determinar niveles basados en puntuación
    if (scorePercentage <= 35) {
        riskLevel = 'bajo';
        interpretation = 'Desarrollo dentro del rango típico';
        autismLevel = null;
    } else if (scorePercentage <= 55) {
        riskLevel = 'moderado';
        interpretation = 'Algunas características de TEA observadas';
        autismLevel = {
            level: 1,
            name: "Nivel 1 - Necesita ayuda",
            description: "Requiere apoyo para desenvolverse en situaciones sociales y comunicativas"
        };
    } else if (scorePercentage <= 75) {
        riskLevel = 'alto';
        interpretation = 'Características significativas de TEA observadas';
        autismLevel = {
            level: 2,
            name: "Nivel 2 - Necesita ayuda notable",
            description: "Requiere apoyo sustancial en comunicación social y flexibilidad comportamental"
        };
    } else {
        riskLevel = 'muy-alto';
        interpretation = 'Características muy marcadas de TEA observadas';
        autismLevel = {
            level: 3,
            name: "Nivel 3 - Necesita ayuda muy notable",
            description: "Requiere apoyo muy sustancial en comunicación social y comportamientos restrictivos"
        };
    }

    const recommendations = getRecommendationsByLevel(riskLevel);
    const homeSupport = getHomeSupportByLevel(riskLevel, quizState.childInfo.ageGroup);

    return {
        totalScore,
        maxScore,
        scorePercentage: Math.round(scorePercentage),
        riskLevel,
        interpretation,
        autismLevel,
        domainScores,
        recommendations,
        homeSupport,
        childInfo: quizState.childInfo
    };
}

// === MOSTRAR RESULTADOS ===

function displayResults(results, duration) {
    // Configurar ícono y título según nivel de riesgo
    const resultsIcon = document.getElementById('resultsIcon');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsSubtitle = document.getElementById('resultsSubtitle');

    if (results.riskLevel === 'bajo') {
        resultsIcon.textContent = '✅';
        resultsTitle.textContent = 'Desarrollo Típico';
        resultsSubtitle.textContent = 'Las características observadas están dentro del rango típico';
    } else if (results.riskLevel === 'moderado') {
        resultsIcon.textContent = '⚠️';
        resultsTitle.textContent = 'Algunas Características TEA';
        resultsSubtitle.textContent = 'Se observan algunas características del espectro autista';
    } else if (results.riskLevel === 'alto') {
        resultsIcon.textContent = '🔍';
        resultsTitle.textContent = 'Características Significativas TEA';
        resultsSubtitle.textContent = 'Se observan características significativas del espectro autista';
    } else {
        resultsIcon.textContent = '🚨';
        resultsTitle.textContent = 'Características Muy Marcadas TEA';
        resultsSubtitle.textContent = 'Se observan características muy marcadas del espectro autista';
    }

    // Mostrar resumen de puntuación
    displayScoreSummary(results);

    // Mostrar nivel de autismo si aplica
    displayAutismLevel(results);

    // Mostrar desglose por dominios
    displayDomainBreakdown(results);

    // Mostrar recomendaciones
    displayRecommendations(results);

    // Mostrar apoyo en casa
    displayHomeSupport(results);

    // Mostrar recomendación profesional
    displayProfessionalGuidance(results);
}

function displayScoreSummary(results) {
    const summaryContainer = document.getElementById('resultsSummary');

    summaryContainer.innerHTML = `
        <div class="score-display">${results.totalScore}/${results.maxScore}</div>
        <div class="score-interpretation">${results.interpretation}</div>
        <div class="score-description">
            Puntuación total: ${results.totalScore} puntos de ${results.maxScore} posibles (${results.scorePercentage}%)
            <br>
            <em>Evaluación para: ${results.childInfo.ageGroup} años - ${results.childInfo.specificAge}</em>
        </div>
    `;
}

function displayAutismLevel(results) {
    const autismLevelContainer = document.getElementById('autismLevel');
    
    if (results.autismLevel) {
        autismLevelContainer.innerHTML = `
            <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 15px; padding: 2rem; margin: 2rem 0;">
                <h3 style="color: #856404; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    🎯 Nivel de Apoyo Identificado
                </h3>
                <div style="background: white; padding: 1.5rem; border-radius: 10px; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; font-size: 1.3rem; margin-bottom: 0.5rem;">
                        ${results.autismLevel.name}
                    </h4>
                    <p style="color: #333; font-size: 1rem; line-height: 1.6; margin: 0;">
                        ${results.autismLevel.description}
                    </p>
                </div>
            </div>
        `;
    } else {
        autismLevelContainer.innerHTML = `
            <div style="background: #d4edda; border: 2px solid #28a745; border-radius: 15px; padding: 2rem; margin: 2rem 0;">
                <h3 style="color: #155724; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    ✅ Desarrollo Típico
                </h3>
                <p style="color: #155724; font-size: 1rem; line-height: 1.6; margin: 0;">
                    Las características observadas están dentro del rango de desarrollo típico para la edad. 
                    Continúa con seguimiento regular del desarrollo.
                </p>
            </div>
        `;
    }
}

function displayDomainBreakdown(results) {
    const breakdownContainer = document.getElementById('resultsBreakdown');
    
    const domainNames = {
        social: 'Interacción Social',
        communication: 'Comunicación',
        repetitive: 'Comportamientos Repetitivos/Intereses',
        sensory: 'Procesamiento Sensorial',
        flexibility: 'Flexibilidad Cognitiva',
        regulation: 'Regulación Emocional',
        play: 'Juego e Imaginación',
        executive: 'Funciones Ejecutivas',
        development: 'Desarrollo General'
    };

    let breakdownHTML = '<h3>📊 Análisis por Áreas del Desarrollo</h3>';
    
    Object.keys(results.domainScores).forEach(domain => {
        const score = results.domainScores[domain];
        if (score.count > 0) {
            const average = score.average.toFixed(1);
            let status = '';
            let statusColor = '';
            
            if (average <= 2.5) {
                status = 'Desarrollo típico';
                statusColor = '#28a745';
            } else if (average <= 3.5) {
                status = 'Algunas diferencias';
                statusColor = '#ffc107';
            } else {
                status = 'Diferencias significativas';
                statusColor = '#dc3545';
            }

            breakdownHTML += `
                <div class="domain-score">
                    <div class="domain-info">
                        <h4>${domainNames[domain]}</h4>
                        <p style="color: ${statusColor}; font-weight: bold;">${status} (${score.count} preguntas evaluadas)</p>
                    </div>
                    <div class="domain-value" style="color: ${statusColor};">${average}/5.0</div>
                </div>
            `;
        }
    });

    breakdownContainer.innerHTML = breakdownHTML;
}

function displayRecommendations(results) {
    const recommendationsContainer = document.getElementById('recommendations');
    
    recommendationsContainer.innerHTML = `
        <h3>🎯 Recomendaciones Generales</h3>
        <ul class="recommendation-list">
            ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;
}

function displayHomeSupport(results) {
    const homeSupportContainer = document.getElementById('homeSupport');
    
    homeSupportContainer.innerHTML = `
        <div style="background: #e8f5e8; border: 2px solid #28a745; border-radius: 15px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #28a745; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                🏠 Estrategias de Apoyo en Casa
            </h3>
            <ul class="recommendation-list">
                ${results.homeSupport.map(strategy => `<li>${strategy}</li>`).join('')}
            </ul>
        </div>
    `;
}

function displayProfessionalGuidance(results) {
    const guidanceContainer = document.getElementById('professionalGuidance');
    let guidance = '';

    if (results.riskLevel === 'bajo') {
        guidance = `Los resultados sugieren un desarrollo dentro del rango típico para ${results.childInfo.specificAge}. Continúa con seguimiento pediátrico regular y estimulación apropiada para la edad. Esta herramienta es un screening inicial y no reemplaza la evaluación clínica profesional.`;
    } else if (results.riskLevel === 'moderado') {
        guidance = `Los resultados indican algunas características del espectro autista que merecen atención profesional. Te recomendamos discutir estos hallazgos con tu pediatra o un especialista en desarrollo. La intervención temprana puede ser muy beneficiosa cuando se implementa apropiadamente.`;
    } else if (results.riskLevel === 'alto') {
        guidance = `Los resultados sugieren características significativas del espectro autista que requieren evaluación profesional. Es importante recordar que este screening no constituye un diagnóstico, pero los hallazgos justifican una evaluación completa por especialistas en desarrollo infantil.`;
    } else {
        guidance = `Los resultados indican características muy marcadas del espectro autista que requieren evaluación profesional urgente. Se recomienda contactar con especialistas en TEA dentro de las próximas 2-4 semanas para una evaluación diagnóstica completa y planificación de intervenciones.`;
    }

    guidanceContainer.textContent = guidance;
}

// === FUNCIONES DE RECOMENDACIONES ===

function getRecommendationsByLevel(riskLevel) {
    const recommendations = {
        'bajo': [
            "Continúa con rutinas de estimulación apropiadas para la edad",
            "Mantén seguimiento regular del desarrollo con su pediatra",
            "Fomenta habilidades sociales mediante juegos interactivos",
            "Proporciona experiencias de aprendizaje variadas y enriquecedoras",
            "Utiliza las herramientas de JuegoTEA para fortalecer diferentes áreas",
            "Celebra logros y proporciona refuerzo positivo constante"
        ],
        'moderado': [
            "Consulta con un especialista en desarrollo infantil",
            "Implementa estrategias de comunicación aumentativa si es apropiado",
            "Crea rutinas estructuradas y predecibles",
            "Proporciona apoyo adicional en situaciones sociales",
            "Considera terapias especializadas (habla, ocupacional, conductual)",
            "Documenta comportamientos para compartir con profesionales"
        ],
        'alto': [
            "Busca evaluación diagnóstica completa con especialistas en TEA",
            "Implementa intervenciones intensivas tempranas",
            "Establece rutinas altamente estructuradas",
            "Utiliza apoyos visuales y sistemas de comunicación alternativos",
            "Accede a servicios de intervención temprana especializados",
            "Conecta con grupos de apoyo para familias"
        ],
        'muy-alto': [
            "Obtén evaluación diagnóstica urgente con equipo multidisciplinario",
            "Implementa plan de intervención intensivo inmediato",
        'muy-alto': [
            "Obtén evaluación diagnóstica urgente con equipo multidisciplinario",
            "Implementa plan de intervención intensivo inmediato",
            "Considera programas especializados en TEA",
            "Establece ambientes altamente estructurados y predecibles",
            "Busca servicios de respiro familiar y apoyo psicológico",
            "Explora opciones educativas especializadas",
            "Conecta con organizaciones especializadas en TEA severo"
        ]
    };

    return recommendations[riskLevel] || recommendations['moderado'];
}

function getHomeSupportByLevel(riskLevel, ageGroup) {
    const baseSupportByAge = {
        "0-2": [
            "Establece rutinas diarias consistentes (alimentación, sueño, juego)",
            "Usa canciones y juegos repetitivos para fomentar la comunicación",
            "Proporciona estimulación sensorial apropiada (texturas, sonidos suaves)",
            "Practica contacto visual durante actividades placenteras",
            "Lee cuentos con imágenes coloridas diariamente",
            "Celebra cada pequeño logro con entusiasmo"
        ],
        "3-6": [
            "Crea horarios visuales con imágenes para actividades diarias",
            "Practica habilidades sociales mediante juegos de roles",
            "Establece espacios tranquilos para autorregulación",
            "Usa técnicas de juego paralelo para fomentar interacción",
            "Implementa sistemas de recompensas visuales",
            "Practica transiciones con avisos anticipados"
        ],
        "6-10": [
            "Desarrolla habilidades de amistad mediante actividades estructuradas",
            "Enseña estrategias de resolución de problemas paso a paso",
            "Practica habilidades conversacionales diariamente",
            "Crea oportunidades para éxito académico y social",
            "Establece rutinas de tarea y estudio consistentes",
            "Fomenta intereses especiales de manera constructiva"
        ],
        "11-14": [
            "Practica habilidades sociales complejas en contextos seguros",
            "Enseña estrategias de manejo del estrés y ansiedad",
            "Desarrolla habilidades de autodefensa apropiadas",
            "Fomenta independencia gradual en tareas cotidianas",
            "Practica habilidades de comunicación asertiva",
            "Explora actividades extracurriculares basadas en intereses"
        ],
        "15-18": [
            "Desarrolla habilidades de vida independiente progresivamente",
            "Practica habilidades laborales y de entrevistas",
            "Enseña manejo de relaciones interpersonales complejas",
            "Fomenta autoconocimiento y autodefensa",
            "Planifica transición a la vida adulta paso a paso",
            "Explora opciones educativas y vocacionales futuras"
        ]
    };

    const additionalSupportByRisk = {
        'bajo': [
            "Mantén comunicación abierta sobre desafíos diarios",
            "Proporciona estructura sin ser excesivamente rígido"
        ],
        'moderado': [
            "Implementa más estructura y rutinas predecibles",
            "Usa apoyos visuales para comunicación e instrucciones",
            "Practica habilidades sociales de manera más intensiva"
        ],
        'alto': [
            "Crea ambientes altamente estructurados y predecibles",
            "Implementa sistemas de comunicación alternativos",
            "Utiliza técnicas de análisis de comportamiento aplicado (ABA)",
            "Establece rutinas de autorregulación diarias"
        ],
        'muy-alto': [
            "Mantén ambientes extremadamente estructurados",
            "Implementa planes de manejo de comportamiento intensivos",
            "Usa apoyos tecnológicos para comunicación",
            "Establece protocolos claros para situaciones de crisis",
            "Busca entrenamiento especializado en técnicas de manejo"
        ]
    };

    const baseSupport = baseSupportByAge[ageGroup] || baseSupportByAge["3-6"];
    const additionalSupport = additionalSupportByRisk[riskLevel] || [];

    return [...baseSupport, ...additionalSupport];
}

// === FUNCIONES DE ACCIÓN ===

function downloadResults() {
    const results = calculateComprehensiveScore();
    generatePDFReport(results);
}

function generatePDFReport(results) {
    // Crear contenido HTML para impresión
    const reportContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4299e1; padding-bottom: 20px;">
                <h1 style="color: #4299e1; margin-bottom: 10px;">🧠 Reporte de Evaluación TEA</h1>
                <h2 style="color: #666; font-weight: normal;">Evaluación Comprensiva del Espectro Autista</h2>
                <p style="color: #888;">Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
            </header>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Información del Evaluado</h3>
                <table style="width: 100%; margin-top: 15px;">
                    <tr><td style="font-weight: bold; padding: 5px;">Grupo de edad:</td><td>${results.childInfo.ageGroup} años</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px;">Edad específica:</td><td>${results.childInfo.specificAge}</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px;">Género:</td><td>${results.childInfo.gender || 'No especificado'}</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px;">Evaluado por:</td><td>${results.childInfo.relationship}</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px;">Preocupaciones previas:</td><td>${results.childInfo.previousConcerns || 'No especificado'}</td></tr>
                </table>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Resultados</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 15px;">
                    <p style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 10px;">
                        ${results.totalScore}/${results.maxScore} puntos (${results.scorePercentage}%)
                    </p>
                    <p style="text-align: center; font-size: 18px; color: #666;">
                        ${results.interpretation}
                    </p>
                </div>
                ${results.autismLevel ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-bottom: 10px;">${results.autismLevel.name}</h4>
                    <p style="color: #856404; margin: 0;">${results.autismLevel.description}</p>
                </div>
                ` : ''}
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Análisis por Áreas</h3>
                ${generateDomainTable(results.domainScores)}
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Recomendaciones Generales</h3>
                <ul style="margin-top: 15px; line-height: 1.6;">
                    ${results.recommendations.map(rec => `<li style="margin-bottom: 10px;">${rec}</li>`).join('')}
                </ul>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Estrategias de Apoyo en Casa</h3>
                <ul style="margin-top: 15px; line-height: 1.6;">
                    ${results.homeSupport.map(strategy => `<li style="margin-bottom: 10px;">${strategy}</li>`).join('')}
                </ul>
            </section>

            <footer style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666;">
                <p><strong>Disclaimer Importante:</strong></p>
                <p>Esta evaluación es una herramienta de screening preliminar y NO constituye un diagnóstico médico. Los resultados deben ser interpretados por un profesional de la salud especializado en desarrollo infantil y TEA. Un resultado que sugiere características del espectro autista no confirma un diagnóstico, así como un resultado típico no descarta completamente la presencia de TEA.</p>
                <p style="margin-top: 15px;">
                    <strong>JuegoTEA</strong> - Herramientas basadas en evidencia científica<br>
                    Para más información: www.juegotea.com
                </p>
            </footer>
        </div>
    `;

    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte TEA - ${results.childInfo.specificAge}</title>
            <style>
                @media print {
                    body { margin: 0; }
                    @page { margin: 2cm; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function generateDomainTable(domainScores) {
    const domainNames = {
        social: 'Interacción Social',
        communication: 'Comunicación',
        repetitive: 'Comportamientos Repetitivos/Intereses',
        sensory: 'Procesamiento Sensorial',
        flexibility: 'Flexibilidad Cognitiva',
        regulation: 'Regulación Emocional',
        play: 'Juego e Imaginación',
        executive: 'Funciones Ejecutivas',
        development: 'Desarrollo General'
    };

    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
    tableHTML += '<tr style="background: #f0f9ff;"><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Área del Desarrollo</th><th style="padding: 10px; border: 1px solid #ddd;">Puntuación Promedio</th><th style="padding: 10px; border: 1px solid #ddd;">Interpretación</th></tr>';

    Object.keys(domainScores).forEach(domain => {
        const score = domainScores[domain];
        if (score.count > 0) {
            const average = score.average.toFixed(1);
            let interpretation = '';
            
            if (average <= 2.5) {
                interpretation = 'Desarrollo típico';
            } else if (average <= 3.5) {
                interpretation = 'Algunas diferencias';
            } else {
                interpretation = 'Diferencias significativas';
            }

            tableHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${domainNames[domain]}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${average}/5.0</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${interpretation}</td>
                </tr>
            `;
        }
    });

    tableHTML += '</table>';
    return tableHTML;
}

function exploreGames() {
    const results = calculateComprehensiveScore();
    let recommendedCategory = 'comunicacion-lenguaje'; // Default

    // Determinar categoría recomendada basada en resultados
    if (results.domainScores.communication && results.domainScores.communication.average > 3.0) {
        recommendedCategory = 'comunicacion-lenguaje';
    } else if (results.domainScores.social && results.domainScores.social.average > 3.0) {
        recommendedCategory = 'habilidades-sociales';
    } else if (results.domainScores.sensory && results.domainScores.sensory.average > 3.0) {
        recommendedCategory = 'integracion-sensorial';
    } else if (results.domainScores.regulation && results.domainScores.regulation.average > 3.0) {
        recommendedCategory = 'regulacion-emocional';
    }

    if (confirm(`Basado en los resultados, te recomendamos explorar los juegos de ${recommendedCategory.replace('-', ' ')}.\n\n¿Quieres ir allá ahora?`)) {
        window.location.href = `../categorias/${recommendedCategory}.html`;
    }
}

function restartQuiz() {
    if (confirm('¿Estás seguro de que quieres iniciar una nueva evaluación? Se perderán los resultados actuales.')) {
        // Reiniciar estado
        quizState.currentQuestion = 0;
        quizState.answers = {};
        quizState.childInfo = {};
        quizState.startTime = null;
        quizState.endTime = null;
        quizState.currentQuestions = [];
        quizState.showingResults = false;

        // Limpiar formularios
        document.getElementById('childAgeGroup').value = '';
        document.getElementById('childSpecificAge').value = '';
        document.getElementById('childGender').value = '';
        document.getElementById('previousConcerns').value = '';
        document.getElementById('relationship').value = '';
        document.getElementById('specificAgeGroup').style.display = 'none';

        // Volver a la introducción
        showSection('introSection');
    }
}

function goBack() {
    if (quizState.showingResults || Object.keys(quizState.answers).length === 0) {
        // Si estamos en resultados o no hay respuestas, volver directamente
        window.location.href = '../index.html';
    } else {
        // Si hay progreso, confirmar
        if (confirm('¿Estás seguro de que quieres salir? Se perderá el progreso actual de la evaluación.')) {
            window.location.href = '../index.html';
        }
    }
}

// === FUNCIONES DE AUDIO ===

function playSelectionSound() {
    playSound(800, 0.1, 'sine');
}

function playNavigationSound() {
    playSound(600, 0.15, 'sine');
}

function playSound(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log('Audio no disponible:', error);
    }
}

// === FUNCIONES DE ALMACENAMIENTO ===

function saveResults(results) {
    try {
        const timestamp = new Date().toISOString();
        const savedResults = {
            timestamp,
            results,
            version: 'TEA-COMPREHENSIVE-1.0',
            duration: quizState.endTime - quizState.startTime
        };

        // Guardar en localStorage
        localStorage.setItem('tea-evaluation-last-results', JSON.stringify(savedResults));
        
        // Guardar en historial
        const history = JSON.parse(localStorage.getItem('tea-evaluation-history') || '[]');
        history.push(savedResults);
        
        // Mantener solo los últimos 5 resultados
        if (history.length > 5) {
            history.splice(0, history.length - 5);
        }
        
        localStorage.setItem('tea-evaluation-history', JSON.stringify(history));
        
        console.log('Resultados guardados exitosamente');
    } catch (error) {
        console.error('Error guardando resultados:', error);
    }
}

function loadPreviousResults() {
    try {
        const saved = localStorage.getItem('tea-evaluation-last-results');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error cargando resultados previos:', error);
    }
    return null;
}

// === INICIALIZACIÓN ===

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Evaluación TEA Comprensiva inicializada');
    
    // Verificar si hay resultados previos
    const previousResults = loadPreviousResults();
    if (previousResults) {
        const daysSince = Math.floor((Date.now() - new Date(previousResults.timestamp).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince < 30) { // Mostrar notificación si es menor a 30 días
            setTimeout(() => {
                if (confirm(`Se encontró una evaluación previa de hace ${daysSince} días.\n\n¿Quieres ver esos resultados o hacer una nueva evaluación?`)) {
                    // Cargar resultados previos
                    displayResults(previousResults.results, 0);
                    showSection('resultsSection');
                }
            }, 2000);
        }
    }
});

// === MANEJO DE ERRORES ===

window.addEventListener('error', function(e) {
    console.error('Error en evaluación TEA:', e.error);
    alert('Ha ocurrido un error. Por favor, recarga la página e intenta nuevamente.');
});

// Prevenir pérdida de datos al cerrar
window.addEventListener('beforeunload', function(e) {
    if (Object.keys(quizState.answers).length > 0 && !quizState.showingResults) {
        e.preventDefault();
        e.returnValue = 'Tienes una evaluación en progreso. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
    }
});

// === ACCESIBILIDAD ADICIONAL ===

// Navegación por teclado en opciones de respuesta
document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('answer-option')) {
        const options = Array.from(document.querySelectorAll('.answer-option'));
        const currentIndex = options.indexOf(e.target);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < options.length - 1) {
                    options[currentIndex + 1].focus();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    options[currentIndex - 1].focus();
                }
                break;
        }
    }
});

console.log('🧠 Evaluación TEA Comprensiva completamente cargada y lista');// 🧠 Evaluación TEA Comprensiva - JavaScript Logic
console.log('🧠 Evaluación TEA Comprensiva iniciada');

// === DATOS DEL QUIZ POR RANGO DE EDAD ===

// Preguntas específicas por grupo de edad basadas en DSM-5 y herramientas validadas
const questionsByAgeGroup = {
    "0-2": [
        {
            id: 1,
            text: "¿Su hijo/a responde cuando lo/la llama por su nombre?",
            help: "Observe si voltea, mira o muestra alguna respuesta cuando dice su nombre.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 2,
            text: "¿Su hijo/a hace contacto visual cuando le habla?",
            help: "Fíjese si mira a sus ojos durante las interacciones.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 3,
            text: "¿Su hijo/a sonríe en respuesta a su cara o sonrisa?",
            help: "Considere si responde con sonrisas cuando usted le sonríe.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 4,
            text: "¿Su hijo/a usa gestos como señalar o hacer adiós con la mano?",
            help: "Observe si usa gestos para comunicarse o interactuar.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 5,
            text: "¿Su hijo/a muestra interés en otros niños?",
            help: "Fíjese si mira, se acerca o trata de interactuar con otros niños.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 6,
            text: "¿Su hijo/a imita acciones simples (aplaudir, hacer sonidos)?",
            help: "Observe si copia sus acciones o gestos de manera espontánea.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 7,
            text: "¿Su hijo/a se calma cuando lo/la consolea?",
            help: "Considere si responde positivamente a sus intentos de consolarlo.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 8,
            text: "¿Su hijo/a parece demasiado sensible a ciertos sonidos?",
            help: "Observe reacciones exageradas a ruidos cotidianos.",
            domain: "sensory",
            scoring: "direct"
        },
        {
            id: 9,
            text: "¿Su hijo/a hace movimientos repetitivos con las manos o cuerpo?",
            help: "Fíjese en movimientos estereotipados o repetitivos.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 10,
            text: "¿Su hijo/a juega de manera apropiada con juguetes?",
            help: "Observe si usa juguetes de manera funcional y apropiada.",
            domain: "play",
            scoring: "reverse"
        },
        {
            id: 11,
            text: "¿Su hijo/a busca atención o consuelo cuando está lastimado o triste?",
            help: "Considere si viene a usted cuando necesita ayuda emocional.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 12,
            text: "¿Su hijo/a entiende instrucciones simples?",
            help: "Observe si comprende órdenes básicas como 'ven aquí' o 'no'.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 13,
            text: "¿Su hijo/a tiene rabietas intensas por cambios menores?",
            help: "Fíjese en reacciones extremas a cambios en rutinas.",
            domain: "flexibility",
            scoring: "direct"
        },
        {
            id: 14,
            text: "¿Su hijo/a comparte alegría o logros con usted?",
            help: "Observe si busca compartir experiencias positivas.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 15,
            text: "¿Su hijo/a evita ciertos alimentos o texturas?",
            help: "Considere si tiene aversiones alimentarias marcadas.",
            domain: "sensory",
            scoring: "direct"
        },
        {
            id: 16,
            text: "¿Su hijo/a desarrolla apegos inusuales a objetos específicos?",
            help: "Observe si se aferra excesivamente a objetos particulares.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 17,
            text: "¿Su hijo/a disfruta juegos sociales simples como peek-a-boo?",
            help: "Fíjese si participa y disfruta juegos interactivos básicos.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 18,
            text: "¿Su hijo/a tiene patrones de sueño muy irregulares?",
            help: "Considere si tiene dificultades significativas para dormir.",
            domain: "regulation",
            scoring: "direct"
        },
        {
            id: 19,
            text: "¿Su hijo/a muestra miedo excesivo a sonidos cotidianos?",
            help: "Observe reacciones de miedo a ruidos normales del hogar.",
            domain: "sensory",
            scoring: "direct"
        },
        {
            id: 20,
            text: "¿Su hijo/a busca el contacto físico y los abrazos?",
            help: "Fíjese si busca o disfruta el contacto físico afectuoso.",
            domain: "social",
            scoring: "reverse"
        }
    ],

    "3-6": [
        {
            id: 1,
            text: "¿Su hijo/a hace amigos fácilmente?",
            help: "Observe si establece relaciones con otros niños de su edad.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 2,
            text: "¿Su hijo/a entiende las reglas de juegos simples?",
            help: "Considere si comprende y sigue reglas básicas en juegos.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 3,
            text: "¿Su hijo/a usa el lenguaje de manera apropiada para comunicarse?",
            help: "Evalúe si se comunica efectivamente con palabras o frases.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 4,
            text: "¿Su hijo/a muestra empatía cuando otros están tristes?",
            help: "Observe si reconoce y responde a las emociones de otros.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 5,
            text: "¿Su hijo/a tiene intereses muy intensos en temas específicos?",
            help: "Fíjese en obsesiones o intereses extremadamente focalizados.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 6,
            text: "¿Su hijo/a adapta su comportamiento según la situación social?",
            help: "Considere si actúa diferente en casa vs. escuela vs. público.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 7,
            text: "¿Su hijo/a entiende el sarcasmo o bromas simples?",
            help: "Observe si comprende el humor apropiado para su edad.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 8,
            text: "¿Su hijo/a tiene rituales específicos que debe seguir?",
            help: "Fíjese en rutinas rígidas que no puede cambiar.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 9,
            text: "¿Su hijo/a mantiene conversaciones de ida y vuelta?",
            help: "Evalúe si puede sostener diálogos apropiados para su edad.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 10,
            text: "¿Su hijo/a tiene dificultades con cambios en la rutina?",
            help: "Observe reacciones a cambios inesperados en horarios.",
            domain: "flexibility",
            scoring: "direct"
        },
        {
            id: 11,
            text: "¿Su hijo/a juega de manera imaginativa y creativa?",
            help: "Considere si desarrolla juegos de fantasía o representación.",
            domain: "play",
            scoring: "reverse"
        },
        {
            id: 12,
            text: "¿Su hijo/a busca atención de manera apropiada?",
            help: "Observe si busca atención de formas socialmente aceptables.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 13,
            text: "¿Su hijo/a tiene sensibilidades sensoriales marcadas?",
            help: "Fíjese en reacciones extremas a texturas, sonidos, o luces.",
            domain: "sensory",
            scoring: "direct"
        },
        {
            id: 14,
            text: "¿Su hijo/a comparte intereses y emociones con otros?",
            help: "Evalúe si comparte experiencias de manera espontánea.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 15,
            text: "¿Su hijo/a usa gestos y expresiones faciales apropiadas?",
            help: "Observe la comunicación no verbal durante interacciones.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 16,
            text: "¿Su hijo/a tiene movimientos repetitivos o estereotipias?",
            help: "Fíjese en movimientos como balancearse, aletear manos, etc.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 17,
            text: "¿Su hijo/a entiende las emociones básicas en otros?",
            help: "Considere si reconoce felicidad, tristeza, enojo en otros.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 18,
            text: "¿Su hijo/a prefiere jugar solo que con otros niños?",
            help: "Observe sus preferencias en situaciones de juego social.",
            domain: "social",
            scoring: "direct"
        },
        {
            id: 19,
            text: "¿Su hijo/a responde apropiadamente a límites y disciplina?",
            help: "Evalúe cómo reacciona a correcciones y límites.",
            domain: "regulation",
            scoring: "reverse"
        },
        {
            id: 20,
            text: "¿Su hijo/a muestra comportamientos autolesivos?",
            help: "Observe si se golpea, muerde, o lastima a sí mismo.",
            domain: "regulation",
            scoring: "direct"
        }
    ],

    "6-10": [
        {
            id: 1,
            text: "¿Su hijo/a tiene amistades cercanas y duraderas?",
            help: "Evalúe la calidad y duración de las relaciones de amistad.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 2,
            text: "¿Su hijo/a comprende las reglas sociales no escritas?",
            help: "Observe si entiende normas sociales implícitas en diferentes contextos.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 3,
            text: "¿Su hijo/a puede trabajar en equipo en proyectos escolares?",
            help: "Considere su capacidad para colaborar efectivamente con compañeros.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 4,
            text: "¿Su hijo/a tiene intereses obsesivos que interfieren con otras actividades?",
            help: "Fíjese si los intereses especiales limitan otras experiencias.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 5,
            text: "¿Su hijo/a adapta su comunicación según con quién habla?",
            help: "Observe si habla diferente con maestros vs. amigos vs. familia.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 6,
            text: "¿Su hijo/a entiende el lenguaje figurado y metáforas simples?",
            help: "Evalúe comprensión de expresiones no literales apropiadas para su edad.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 7,
            text: "¿Su hijo/a maneja bien las transiciones entre actividades?",
            help: "Observe cómo responde a cambios de una actividad a otra.",
            domain: "flexibility",
            scoring: "reverse"
        },
        {
            id: 8,
            text: "¿Su hijo/a busca apoyo cuando enfrenta problemas?",
            help: "Considere si pide ayuda de manera apropiada cuando la necesita.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 9,
            text: "¿Su hijo/a tiene rutinas rígidas que no puede modificar?",
            help: "Fíjese en inflexibilidad extrema hacia cambios en rutinas.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 10,
            text: "¿Su hijo/a reconoce cuando ha cometido errores sociales?",
            help: "Observe si se da cuenta de malentendidos en interacciones.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 11,
            text: "¿Su hijo/a participa apropiadamente en conversaciones grupales?",
            help: "Evalúe habilidades para tomar turnos y mantener temas relevantes.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 12,
            text: "¿Su hijo/a tiene sensibilidades sensoriales que afectan su día a día?",
            help: "Considere impacto de sensibilidades en actividades escolares y sociales.",
            domain: "sensory",
            scoring: "direct"
        },
        {
            id: 13,
            text: "¿Su hijo/a muestra empeo apropiada hacia otros?",
            help: "Observe capacidad para ponerse en el lugar de otros.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 14,
            text: "¿Su hijo/a tiene dificultades para regular sus emociones?",
            help: "Fíjese en la intensidad y duración de reacciones emocionales.",
            domain: "regulation",
            scoring: "direct"
        },
        {
            id: 15,
            text: "¿Su hijo/a inicia interacciones sociales de manera apropiada?",
            help: "Evalúe si comienza conversaciones y juegos adecuadamente.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 16,
            text: "¿Su hijo/a entiende el concepto de intimidad personal?",
            help: "Observe si comprende límites apropiados de contacto físico.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 17,
            text: "¿Su hijo/a tiene movimientos o sonidos repetitivos?",
            help: "Fíjese en estereotipias motoras o vocales.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 18,
            text: "¿Su hijo/a puede manejar múltiples instrucciones a la vez?",
            help: "Considere capacidad para seguir secuencias de tareas complejas.",
            domain: "executive",
            scoring: "reverse"
        },
        {
            id: 19,
            text: "¿Su hijo/a demuestra flexibilidad en resolución de problemas?",
            help: "Observe si puede considerar múltiples soluciones a problemas.",
            domain: "flexibility",
            scoring: "reverse"
        },
        {
            id: 20,
            text: "¿Su hijo/a busca validación social excesiva?",
            help: "Evalúe dependencia de aprobación externa para autoestima.",
            domain: "social",
            scoring: "direct"
        }
    ],

    "11-14": [
        {
            id: 1,
            text: "¿Su hijo/a mantiene amistades apropiadas para su edad?",
            help: "Evalúe la calidad y reciprocidad de las relaciones de amistad.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 2,
            text: "¿Su hijo/a entiende las dinámicas sociales complejas?",
            help: "Observe comprensión de jerarquías sociales y relaciones grupales.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 3,
            text: "¿Su hijo/a puede interpretar el lenguaje corporal y señales sociales?",
            help: "Considere habilidad para leer comunicación no verbal.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 4,
            text: "¿Su hijo/a tiene intereses intensos que dominan conversaciones?",
            help: "Fíjese si los intereses especiales interfieren con interacciones sociales.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 5,
            text: "¿Su hijo/a adapta su comportamiento a diferentes contextos sociales?",
            help: "Observe flexibilidad comportamental en escuela, casa, y eventos sociales.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 6,
            text: "¿Su hijo/a comprende el sarcasmo y humor apropiado para su edad?",
            help: "Evalúe entendimiento de comunicación indirecta y humor social.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 7,
            text: "¿Su hijo/a maneja bien los cambios inesperados?",
            help: "Considere flexibilidad ante modificaciones en planes o rutinas.",
            domain: "flexibility",
            scoring: "reverse"
        },
        {
            id: 8,
            text: "¿Su hijo/a busca independencia apropiada para su edad?",
            help: "Observe desarrollo de autonomía y toma de decisiones.",
            domain: "development",
            scoring: "reverse"
        },
        {
            id: 9,
            text: "¿Su hijo/a tiene rituales o rutinas rígidas?",
            help: "Fíjese en comportamientos repetitivos que no puede modificar.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 10,
            text: "¿Su hijo/a reconoce y expresa emociones complejas?",
            help: "Evalúe capacidad para identificar y comunicar estados emocionales variados.",
            domain: "regulation",
            scoring: "reverse"
        },
        {
            id: 11,
            text: "¿Su hijo/a participa en actividades grupales voluntariamente?",
            help: "Observe motivación para unirse a actividades sociales.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 12,
            text: "¿Su hijo/a tiene sensibilidades sensoriales que afectan su participación social?",
            help: "Considere impacto de sensibilidades en contextos sociales y académicos.",
            domain: "sensory",
            scoring: "direct"
        },
        {
            id: 13,
            text: "¿Su hijo/a demuestra perspectiva social apropiada?",
            help: "Fíjese en capacidad para considerar puntos de vista de otros.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 14,
            text: "¿Su hijo/a tiene dificultades para regular la intensidad emocional?",
            help: "Observe control de respuestas emocionales en situaciones estresantes.",
            domain: "regulation",
            scoring: "direct"
        },
        {
            id: 15,
            text: "¿Su hijo/a inicia y mantiene conversaciones apropiadamente?",
            help: "Evalúe habilidades conversacionales bidireccionales.",
            domain: "communication",
            scoring: "reverse"
        },
        {
            id: 16,
            text: "¿Su hijo/a comprende límites sociales y personales?",
            help: "Observe entendimiento de privacidad y espacio personal.",
            domain: "social",
            scoring: "reverse"
        },
        {
            id: 17,
            text: "¿Su hijo/a muestra comportamientos repetitivos o estereotipados?",
            help: "Fíjese en movimientos, sonidos o rutinas repetitivas.",
            domain: "repetitive",
            scoring: "direct"
        },
        {
            id: 18,
            text: "¿Su hijo/a puede planificar y organizar tareas complejas?",
            help: "Considere habilidades de función ejecutiva apropiadas para la edad.",
            domain: "executive",
            scoring: "reverse"
        },
        {
            id: 19,
            text: "¿Su hijo/a demuestra flexibilidad cognitiva en resolución de problemas?",
            help: "Observe capacidad para cambiar estrategias cuando es necesario.",
            domain: "flexibility",
            scoring: "reverse"
        },
        {
            id: 20,
            text: "¿Su hijo/a busca apoyo emocional de manera apropiada?",
            help: "Eval// 🧠 Q-CHAT Quiz - JavaScript Logic
console.log('🧠 Q-CHAT Quiz iniciado');

// === DATOS DEL QUIZ ===

// Preguntas del Q-CHAT validadas científicamente
const qchatQuestions = [
    {
        id: 1,
        text: "¿Su hijo/a disfruta ser mecido, rebotado en su rodilla, etc.?",
        help: "Observe si el niño muestra placer durante actividades de movimiento físico y balanceo.",
        domain: "social",
        scoring: "reverse" // 5=siempre, 1=nunca
    },
    {
        id: 2,
        text: "¿Su hijo/a muestra interés en otros niños?",
        help: "Fíjese si mira, se acerca o trata de interactuar con otros niños de su edad.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 3,
        text: "¿Su hijo/a le gusta subir a sitios, como escalones, equipos de juego, o muebles?",
        help: "Observe si busca activamente oportunidades para trepar y explorar físicamente.",
        domain: "motor",
        scoring: "reverse"
    },
    {
        id: 4,
        text: "¿Su hijo/a disfruta jugar al escondite/peek-a-boo/cu-cu?",
        help: "Considere si participa activamente y muestra alegría durante estos juegos interactivos.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 5,
        text: "¿Su hijo/a alguna vez PRETENDE, por ejemplo, hacer una llamada telefónica, cuidar muñecas, o cualquier otra cosa?",
        help: "Observe si realiza juegos de imitación o representación simbólica de actividades cotidianas.",
        domain: "communication",
        scoring: "reverse"
    },
    {
        id: 6,
        text: "¿Su hijo/a alguna vez usa su dedo índice para SEÑALAR, para pedir algo?",
        help: "Fíjese si extiende el dedo índice para indicar objetos que desea obtener.",
        domain: "communication",
        scoring: "reverse"
    },
    {
        id: 7,
        text: "¿Su hijo/a alguna vez usa su dedo índice para SEÑALAR, para indicar interés en algo?",
        help: "Observe si señala objetos o eventos para compartir su interés con usted.",
        domain: "communication",
        scoring: "reverse"
    },
    {
        id: 8,
        text: "¿Su hijo/a puede jugar apropiadamente con juguetes pequeños (por ej. carros o bloques) sin solo llevárselos a la boca, manosearlos o tirarlos?",
        help: "Considere si manipula juguetes de manera funcional y apropiada para su propósito.",
        domain: "motor",
        scoring: "reverse"
    },
    {
        id: 9,
        text: "¿Su hijo/a alguna vez le TRAE objetos para MOSTRARLE algo?",
        help: "Observe si comparte objetos interesantes acercándoselos para que usted los vea.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 10,
        text: "¿Su hijo/a le mira a los ojos por más de un segundo o dos?",
        help: "Fíjese en la duración y calidad del contacto visual durante interacciones.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 11,
        text: "¿Su hijo/a alguna vez parece ser demasiado sensible a ruidos (por ej. tapándose los oídos)?",
        help: "Observe reacciones exageradas a sonidos cotidianos o ambientales.",
        domain: "sensory",
        scoring: "direct" // 1=nunca, 5=siempre
    },
    {
        id: 12,
        text: "¿Su hijo/a sonríe en respuesta a su cara o su sonrisa?",
        help: "Considere si responde con sonrisas cuando usted le sonríe directamente.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 13,
        text: "¿Su hijo/a imita lo que usted hace? (por ej. hacer una mueca, aplaudir, hacer sonidos)",
        help: "Observe si copia sus acciones, gestos o sonidos de manera espontánea.",
        domain: "communication",
        scoring: "reverse"
    },
    {
        id: 14,
        text: "¿Su hijo/a responde cuando usted lo/la llama por su nombre?",
        help: "Fíjese si voltea, mira o muestra alguna respuesta cuando dice su nombre.",
        domain: "communication",
        scoring: "reverse"
    },
    {
        id: 15,
        text: "Si usted señala un juguete al otro lado del cuarto, ¿su hijo/a LO MIRA?",
        help: "Observe si sigue la dirección de su dedo para mirar el objeto señalado.",
        domain: "communication",
        scoring: "reverse"
    },
    {
        id: 16,
        text: "¿Su hijo/a camina?",
        help: "Considere si puede caminar de forma independiente sin apoyo.",
        domain: "motor",
        scoring: "reverse"
    },
    {
        id: 17,
        text: "¿Su hijo/a mira las cosas que usted está mirando?",
        help: "Observe si sigue su mirada hacia objetos o eventos de interés.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 18,
        text: "¿Su hijo/a hace movimientos raros con los dedos cerca de su cara?",
        help: "Fíjese en movimientos repetitivos o estereotipados de manos cerca del rostro.",
        domain: "repetitive",
        scoring: "direct"
    },
    {
        id: 19,
        text: "¿Su hijo/a trata de atraer su atención hacia su propia actividad?",
        help: "Observe si busca que usted mire lo que está haciendo o jugando.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 20,
        text: "¿Alguna vez se ha preguntado si su hijo/a podría ser sordo/a?",
        help: "Considere si ha tenido dudas sobre su audición por falta de respuestas.",
        domain: "communication",
        scoring: "direct"
    },
    {
        id: 21,
        text: "¿Su hijo/a entiende lo que la gente dice?",
        help: "Observe si comprende instrucciones simples y palabras familiares.",
        domain: "communication",
        scoring: "reverse"
    },
    {
        id: 22,
        text: "¿Su hijo/a a veces se queda mirando al vacío o camina sin rumbo?",
        help: "Fíjese en períodos de desconexión o movimientos sin propósito aparente.",
        domain: "attention",
        scoring: "direct"
    },
    {
        id: 23,
        text: "¿Su hijo/a mira su cara para verificar su reacción cuando se enfrenta con algo extraño?",
        help: "Observe si busca su expresión facial en situaciones nuevas o inciertas.",
        domain: "social",
        scoring: "reverse"
    },
    {
        id: 24,
        text: "¿Su hijo/a le gusta las actividades de movimiento (por ej. ser cargado o rebotado en sus rodillas)?",
        help: "Considere si disfruta y busca activamente experiencias de movimiento.",
        domain: "sensory",
        scoring: "reverse"
    },
    {
        id: 25,
        text: "¿Su hijo/a tiene contacto visual normal?",
        help: "Evalúe la calidad y frecuencia general del contacto visual en diferentes situaciones.",
        domain: "social",
        scoring: "reverse"
    }
];

// Opciones de respuesta
const answerOptions = [
    { value: 1, text: "Nunca", description: "No ocurre en absoluto" },
    { value: 2, text: "Raramente", description: "Ocurre muy pocas veces" },
    { value: 3, text: "A veces", description: "Ocurre ocasionalmente" },
    { value: 4, text: "Con frecuencia", description: "Ocurre regularmente" },
    { value: 5, text: "Siempre", description: "Ocurre constantemente" }
];

// === ESTADO DEL QUIZ ===
const quizState = {
    currentQuestion: 0,
    answers: {},
    childInfo: {},
    startTime: null,
    endTime: null,
    showingResults: false
};

// === FUNCIONES DE NAVEGACIÓN ===

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function startQuiz() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showSection('ageSection');
        speakText("Comenzando la evaluación Q-CHAT. Por favor, proporciona información básica del niño.");
    }, 1000);
}

function showIntro() {
    showSection('introSection');
}

function validateAndStartQuestions() {
    const age = document.getElementById('childAge').value;
    const relationship = document.getElementById('relationship').value;

    if (!age || !relationship) {
        alert('Por favor, completa todos los campos obligatorios marcados.');
        return;
    }

    // Verificar rango de edad apropiado
    const ageNum = parseInt(age);
    if (ageNum < 18 || ageNum > 24) {
        if (confirm(`El Q-CHAT está validado específicamente para niños de 18-24 meses. Tu hijo tiene ${age} meses.\n\n¿Deseas continuar de todas formas? Te recomendamos consultar con un profesional para herramientas más apropiadas para esta edad.`)) {
            proceedToQuestions();
        }
    } else {
        proceedToQuestions();
    }
}

function proceedToQuestions() {
    // Guardar información del niño
    quizState.childInfo = {
        age: document.getElementById('childAge').value,
        gender: document.getElementById('childGender').value,
        previousConcerns: document.getElementById('previousConcerns').value,
        relationship: document.getElementById('relationship').value
    };

    quizState.startTime = new Date();
    showSection('questionsSection');
    loadQuestion(0);
    speakText("Comenzando las preguntas de evaluación. Lee cada pregunta cuidadosamente y selecciona la respuesta que mejor describa a tu hijo.");
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = ['introSection', 'ageSection', 'questionsSection', 'resultsSection'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });

    // Mostrar la sección solicitada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('fade-in');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === FUNCIONES DE PREGUNTAS ===

function loadQuestion(questionIndex) {
    if (questionIndex >= qchatQuestions.length) {
        calculateAndShowResults();
        return;
    }

    quizState.currentQuestion = questionIndex;
    const question = qchatQuestions[questionIndex];

    // Actualizar elementos de la UI
    document.getElementById('currentQuestion').textContent = questionIndex + 1;
    document.getElementById('totalQuestions').textContent = qchatQuestions.length;
    document.getElementById('questionNumber').textContent = questionIndex + 1;
    document.getElementById('questionText').textContent = question.text;
    document.getElementById('questionHelp').textContent = question.help;

    // Actualizar barra de progreso
    const progress = ((questionIndex + 1) / qchatQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressPercentage').textContent = `${Math.round(progress)}%`;

    // Generar opciones de respuesta
    generateAnswerOptions(question.id);

    // Actualizar botones de navegación
    updateNavigationButtons();

    // Leer pregunta en voz alta
    setTimeout(() => {
        speakText(`Pregunta ${questionIndex + 1}. ${question.text}`);
    }, 500);
}

function generateAnswerOptions(questionId) {
    const container = document.getElementById('answerOptions');
    container.innerHTML = '';

    answerOptions.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.setAttribute('data-value', option.value);
        optionElement.setAttribute('tabindex', '0');
        optionElement.setAttribute('role', 'radio');
        optionElement.setAttribute('aria-label', `${option.text}: ${option.description}`);

        // Verificar si esta opción ya está seleccionada
        if (quizState.answers[questionId] === option.value) {
            optionElement.classList.add('selected');
        }

        optionElement.innerHTML = `
            <div class="option-radio"></div>
            <div class="option-content">
                <div class="option-text">${option.text}</div>
                <div class="option-description">${option.description}</div>
            </div>
        `;

        // Event listeners
        optionElement.addEventListener('click', () => selectAnswer(questionId, option.value));
        optionElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectAnswer(questionId, option.value);
            }
        });

        container.appendChild(optionElement);
    });
}

function selectAnswer(questionId, value) {
    // Guardar respuesta
    quizState.answers[questionId] = value;

    // Actualizar UI
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (parseInt(option.getAttribute('data-value')) === value) {
            option.classList.add('selected');
        }
    });

    // Actualizar botones de navegación
    updateNavigationButtons();

    // Feedback de audio
    playSelectionSound();
    speakText(`Seleccionado: ${answerOptions.find(opt => opt.value === value).text}`);

    console.log(`Respuesta guardada - Pregunta ${questionId}: ${value}`);
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Botón anterior
    prevBtn.disabled = quizState.currentQuestion === 0;

    // Botón siguiente - habilitar solo si hay respuesta seleccionada
    const currentQuestionId = qchatQuestions[quizState.currentQuestion].id;
    nextBtn.disabled = !quizState.answers.hasOwnProperty(currentQuestionId);

    // Cambiar texto del botón siguiente en la última pregunta
    if (quizState.currentQuestion === qchatQuestions.length - 1) {
        nextBtn.innerHTML = 'Ver Resultados →';
    } else {
        nextBtn.innerHTML = 'Siguiente →';
    }
}

function previousQuestion() {
    if (quizState.currentQuestion > 0) {
        loadQuestion(quizState.currentQuestion - 1);
        playNavigationSound();
    }
}

function nextQuestion() {
    const currentQuestionId = qchatQuestions[quizState.currentQuestion].id;
    
    if (!quizState.answers.hasOwnProperty(currentQuestionId)) {
        alert('Por favor, selecciona una respuesta antes de continuar.');
        return;
    }

    if (quizState.currentQuestion < qchatQuestions.length - 1) {
        loadQuestion(quizState.currentQuestion + 1);
        playNavigationSound();
    } else {
        // Última pregunta - mostrar resultados
        calculateAndShowResults();
    }
}

// === CÁLCULO DE RESULTADOS ===

function calculateAndShowResults() {
    quizState.endTime = new Date();
    const duration = (quizState.endTime - quizState.startTime) / 1000; // segundos

    showLoading();

    setTimeout(() => {
        hideLoading();
        
        // Calcular puntuación total
        const results = calculateQChatScore();
        
        // Mostrar resultados
        displayResults(results, duration);
        
        // Guardar resultados
        saveResults(results);
        
        showSection('resultsSection');
        
        speakText("Evaluación completada. Revisando resultados.");
    }, 2000);
}

function calculateQChatScore() {
    let totalScore = 0;
    const domainScores = {
        social: { total: 0, count: 0 },
        communication: { total: 0, count: 0 },
        motor: { total: 0, count: 0 },
        sensory: { total: 0, count: 0 },
        repetitive: { total: 0, count: 0 },
        attention: { total: 0, count: 0 }
    };

    // Calcular puntuación para cada pregunta
    qchatQuestions.forEach(question => {
        const rawAnswer = quizState.answers[question.id];
        let score;

        // Aplicar sistema de puntuación
        if (question.scoring === 'reverse') {
            // Para preguntas de desarrollo típico: 5=siempre se convierte en 1 punto, 1=nunca se convierte en 5 puntos
            score = 6 - rawAnswer;
        } else {
            // Para preguntas de señales de alerta: mantener puntuación directa
            score = rawAnswer;
        }

        totalScore += score;

        // Acumular por dominio
        if (domainScores[question.domain]) {
            domainScores[question.domain].total += score;
            domainScores[question.domain].count += 1;
        }
    });

    // Calcular promedios por dominio
    Object.keys(domainScores).forEach(domain => {
        if (domainScores[domain].count > 0) {
            domainScores[domain].average = domainScores[domain].total / domainScores[domain].count;
        }
    });

    // Determinar nivel de riesgo basado en investigación del Q-CHAT
    let riskLevel, interpretation, recommendations;

    if (totalScore <= 39) {
        riskLevel = 'bajo';
        interpretation = 'Desarrollo típico';
        recommendations = getTypicalDevelopmentRecommendations();
    } else if (totalScore <= 59) {
        riskLevel = 'moderado';
        interpretation = 'Algunas diferencias observadas';
        recommendations = getModerateConcernRecommendations();
    } else {
        riskLevel = 'alto';
        interpretation = 'Diferencias significativas observadas';
        recommendations = getHighConcernRecommendations();
    }

    return {
        totalScore,
        maxScore: qchatQuestions.length * 5,
        riskLevel,
        interpretation,
        domainScores,
        recommendations,
        childInfo: quizState.childInfo
    };
}

// === MOSTRAR RESULTADOS ===

function displayResults(results, duration) {
    // Configurar ícono y título según nivel de riesgo
    const resultsIcon = document.getElementById('resultsIcon');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsSubtitle = document.getElementById('resultsSubtitle');

    if (results.riskLevel === 'bajo') {
        resultsIcon.textContent = '✅';
        resultsTitle.textContent = 'Desarrollo Dentro del Rango Típico';
        resultsSubtitle.textContent = 'Las observaciones sugieren un desarrollo típico';
    } else if (results.riskLevel === 'moderado') {
        resultsIcon.textContent = '⚠️';
        resultsTitle.textContent = 'Algunas Diferencias Observadas';
        resultsSubtitle.textContent = 'Se recomienda seguimiento con profesional';
    } else {
        resultsIcon.textContent = '🔍';
        resultsTitle.textContent = 'Diferencias Significativas Observadas';
        resultsSubtitle.textContent = 'Se recomienda evaluación profesional';
    }

    // Mostrar resumen de puntuación
    displayScoreSummary(results);

    // Mostrar desglose por dominios
    displayDomainBreakdown(results);

    // Mostrar recomendaciones
    displayRecommendations(results);

    // Mostrar próximos pasos
    displayNextSteps(results);

    // Mostrar recomendación profesional
    displayProfessionalGuidance(results);
}

function displayScoreSummary(results) {
    const summaryContainer = document.getElementById('resultsSummary');
    const percentage = Math.round((results.totalScore / results.maxScore) * 100);

    summaryContainer.innerHTML = `
        <div class="score-display">${results.totalScore}/${results.maxScore}</div>
        <div class="score-interpretation">${results.interpretation}</div>
        <div class="score-description">
            Puntuación total: ${results.totalScore} puntos de ${results.maxScore} posibles (${percentage}%)
            <br>
            <em>Niveles de referencia: Bajo riesgo: ≤39, Riesgo moderado: 40-59, Alto riesgo: ≥60</em>
        </div>
    `;
}

function displayDomainBreakdown(results) {
    const breakdownContainer = document.getElementById('resultsBreakdown');
    
    const domainNames = {
        social: 'Interacción Social',
        communication: 'Comunicación',
        motor: 'Habilidades Motoras',
        sensory: 'Procesamiento Sensorial',
        repetitive: 'Comportamientos Repetitivos',
        attention: 'Atención y Concentración'
    };

    let breakdownHTML = '<h3>📊 Desglose por Áreas del Desarrollo</h3>';
    
    Object.keys(results.domainScores).forEach(domain => {
        const score = results.domainScores[domain];
        if (score.count > 0) {
            const average = score.average.toFixed(1);
            let status = '';
            
            if (average <= 2.0) {
                status = 'Desarrollo típico';
            } else if (average <= 3.5) {
                status = 'Algunas diferencias';
            } else {
                status = 'Diferencias significativas';
            }

            breakdownHTML += `
                <div class="domain-score">
                    <div class="domain-info">
                        <h4>${domainNames[domain]}</h4>
                        <p>${status} (${score.count} preguntas evaluadas)</p>
                    </div>
                    <div class="domain-value">${average}/5.0</div>
                </div>
            `;
        }
    });

    breakdownContainer.innerHTML = breakdownHTML;
}

function displayRecommendations(results) {
    const recommendationsContainer = document.getElementById('recommendations');
    
    recommendationsContainer.innerHTML = `
        <h3>🎯 Recomendaciones Personalizadas</h3>
        <ul class="recommendation-list">
            ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;
}

function displayNextSteps(results) {
    const nextStepsContainer = document.getElementById('nextSteps');
    let stepsHTML = '<h3>📋 Próximos Pasos Recomendados</h3><ul class="recommendation-list">';

    if (results.riskLevel === 'bajo') {
        stepsHTML += `
            <li>Continúa observando el desarrollo de tu hijo de manera regular</li>
            <li>Mantén las rutinas de estimulación temprana y juego interactivo</li>
            <li>Utiliza los juegos de JuegoTEA para fortalecer áreas específicas</li>
            <li>Programa controles pediátricos de rutina según recomendaciones médicas</li>
        `;
    } else if (results.riskLevel === 'moderado') {
        stepsHTML += `
            <li>Programa una cita con tu pediatra para discutir estos resultados</li>
            <li>Considera una evaluación del desarrollo más detallada</li>
            <li>Implementa estrategias de estimulación temprana específicas</li>
            <li>Documenta comportamientos específicos para compartir con profesionales</li>
            <li>Repite esta evaluación en 3-6 meses para monitorear progreso</li>
        `;
    } else {
        stepsHTML += `
            <li><strong>Consulta con tu pediatra o especialista en desarrollo infantil dentro de las próximas 2-4 semanas</strong></li>
            <li>Solicita derivación para evaluación diagnóstica completa (ADOS-2, ADI-R)</li>
            <li>Considera evaluación de audiología para descartar problemas auditivos</li>
            <li>Busca servicios de intervención temprana en tu área</li>
            <li>Conecta con grupos de apoyo para familias</li>
            <li>Mantén registros detallados de comportamientos y desarrollo</li>
        `;
    }

    stepsHTML += '</ul>';
    nextStepsContainer.innerHTML = stepsHTML;
}

function displayProfessionalGuidance(results) {
    const guidanceContainer = document.getElementById('professionalGuidance');
    let guidance = '';

    if (results.riskLevel === 'bajo') {
        guidance = `Los resultados sugieren un desarrollo dentro del rango típico para la edad de ${results.childInfo.age} meses. Continúa con seguimiento pediátrico regular y estimulación apropiada. Recuerda que esta herramienta es un screening inicial y no reemplaza la evaluación clínica profesional.`;
    } else if (results.riskLevel === 'moderado') {
        guidance = `Los resultados indican algunas diferencias que merecen atención profesional. Te recomendamos discutir estos hallazgos con tu pediatra, quien puede determinar si es necesaria una evaluación más detallada. La intervención temprana, cuando es necesaria, es más efectiva cuanto antes se inicie.`;
    } else {
        guidance = `Los resultados sugieren diferencias significativas que requieren evaluación profesional pronto. Es importante recordar que este screening no constituye un diagnóstico, pero los hallazgos justifican una evaluación más detallada por parte de especialistas en desarrollo infantil. La detección temprana permite acceso más rápido a apoyos apropiados.`;
    }

    guidanceContainer.textContent = guidance;
}

// === FUNCIONES DE RECOMENDACIONES ===

function getTypicalDevelopmentRecommendations() {
    return [
        "Continúa con rutinas de juego interactivo diario y lectura de cuentos",
        "Fomenta el desarrollo del lenguaje mediante conversaciones frecuentes",
        "Proporciona oportunidades variadas para exploración sensorial segura",
        "Mantén rutinas consistentes que promuevan seguridad y predictibilidad",
        "Utiliza los juegos de JuegoTEA para enriquecer experiencias de aprendizaje",
        "Celebra logros del desarrollo y proporciona estímulo positivo constante"
    ];
}

function getModerateConcernRecommendations() {
    return [
        "Incrementa oportunidades para interacciones sociales estructuradas",
        "Practica habilidades de comunicación mediante juegos de imitación",
        "Implementa rutinas visuales para apoyar transiciones y comprensión",
        "Proporciona experiencias sensoriales graduales y controladas",
        "Utiliza técnicas de atención conjunta durante actividades diarias",
        "Documenta progreso en áreas específicas para seguimiento profesional",
        "Explora juegos de JuegoTEA enfocados en comunicación y habilidades sociales"
    ];
}

function getHighConcernRecommendations() {
    return [
        "Busca evaluación profesional especializada en desarrollo infantil temprano",
        "Implementa estrategias de comunicación aumentativa si es apropiado",
        "Crea ambientes estructurados que reduzcan sobreestimulación",
        "Establece rutinas altamente predecibles y utiliza apoyos visuales",
        "Practica habilidades de autorregulación mediante técnicas calmantes",
        "Conecta con recursos de intervención temprana en tu comunidad",
        "Considera participación en programas de entrenamiento parental especializados",
        "Utiliza herramientas de JuegoTEA como apoyo complementario bajo orientación profesional"
    ];
}

// === FUNCIONES DE ACCIÓN ===

function downloadResults() {
    const results = calculateQChatScore();
    generatePDFReport(results);
}

function generatePDFReport(results) {
    // Crear contenido HTML para impresión
    const reportContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4299e1; padding-bottom: 20px;">
                <h1 style="color: #4299e1; margin-bottom: 10px;">🧠 Reporte Q-CHAT</h1>
                <h2 style="color: #666; font-weight: normal;">Evaluación Temprana del Desarrollo</h2>
                <p style="color: #888;">Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
            </header>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Información del Niño</h3>
                <table style="width: 100%; margin-top: 15px;">
                    <tr><td style="font-weight: bold; padding: 5px;">Edad:</td><td>${results.childInfo.age} meses</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px;">Género:</td><td>${results.childInfo.gender || 'No especificado'}</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px;">Evaluado por:</td><td>${results.childInfo.relationship}</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px;">Preocupaciones previas:</td><td>${results.childInfo.previousConcerns || 'No especificado'}</td></tr>
                </table>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Resultados</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 15px;">
                    <p style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 10px;">
                        ${results.totalScore}/${results.maxScore} puntos
                    </p>
                    <p style="text-align: center; font-size: 18px; color: #666;">
                        ${results.interpretation}
                    </p>
                </div>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Desglose por Áreas</h3>
                ${generateDomainTable(results.domainScores)}
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #4299e1; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Recomendaciones</h3>
                <ul style="margin-top: 15px; line-height: 1.6;">
                    ${results.recommendations.map(rec => `<li style="margin-bottom: 10px;">${rec}</li>`).join('')}
                </ul>
            </section>

            <footer style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666;">
                <p><strong>Disclaimer Importante:</strong></p>
                <p>Esta evaluación Q-CHAT es una herramienta de screening preliminar y NO constituye un diagnóstico médico. Los resultados deben ser interpretados por un profesional de la salud especializado en desarrollo infantil. Un resultado atípico no confirma autismo, así como un resultado típico no lo descarta completamente.</p>
                <p style="margin-top: 15px;">
                    <strong>JuegoTEA</strong> - Herramientas basadas en evidencia científica<br>
                    Para más información: www.juegotea.com
                </p>
            </footer>
        </div>
    `;

    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Q-CHAT - ${results.childInfo.age} meses</title>
            <style>
                @media print {
                    body { margin: 0; }
                    @page { margin: 2cm; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function generateDomainTable(domainScores) {
    const domainNames = {
        social: 'Interacción Social',
        communication: 'Comunicación',
        motor: 'Habilidades Motoras',
        sensory: 'Procesamiento Sensorial',
        repetitive: 'Comportamientos Repetitivos',
        attention: 'Atención y Concentración'
    };

    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
    tableHTML += '<tr style="background: #f0f9ff;"><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Área del Desarrollo</th><th style="padding: 10px; border: 1px solid #ddd;">Puntuación Promedio</th><th style="padding: 10px; border: 1px solid #ddd;">Interpretación</th></tr>';

    Object.keys(domainScores).forEach(domain => {
        const score = domainScores[domain];
        if (score.count > 0) {
            const average = score.average.toFixed(1);
            let interpretation = '';
            
            if (average <= 2.0) {
                interpretation = 'Desarrollo típico';
            } else if (average <= 3.5) {
                interpretation = 'Algunas diferencias';
            } else {
                interpretation = 'Diferencias significativas';
            }

            tableHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${domainNames[domain]}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${average}/5.0</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${interpretation}</td>
                </tr>
            `;
        }
    });

    tableHTML += '</table>';
    return tableHTML;
}

function exploreGames() {
    const results = calculateQChatScore();
    let recommendedCategory = 'comunicacion-lenguaje'; // Default

    // Determinar categoría recomendada basada en resultados
    if (results.domainScores.communication && results.domainScores.communication.average > 3.0) {
        recommendedCategory = 'comunicacion-lenguaje';
    } else if (results.domainScores.social && results.domainScores.social.average > 3.0) {
        recommendedCategory = 'habilidades-sociales';
    } else if (results.domainScores.sensory && results.domainScores.sensory.average > 3.0) {
        recommendedCategory = 'integracion-sensorial';
    }

    if (confirm(`Basado en los resultados, te recomendamos explorar los juegos de ${recommendedCategory.replace('-', ' ')}.\n\n¿Quieres ir allá ahora?`)) {
        window.location.href = `../categorias/${recommendedCategory}.html`;
    }
}

function restartQuiz() {
    if (confirm('¿Estás seguro de que quieres iniciar una nueva evaluación? Se perderán los resultados actuales.')) {
        // Reiniciar estado
        quizState.currentQuestion = 0;
        quizState.answers = {};
        quizState.childInfo = {};
        quizState.startTime = null;
        quizState.endTime = null;
        quizState.showingResults = false;

        // Limpiar formularios
        document.getElementById('childAge').value = '';
        document.getElementById('childGender').value = '';
        document.getElementById('previousConcerns').value = '';
        document.getElementById('relationship').value = '';

        // Volver a la introducción
        showSection('introSection');
        
        speakText('Iniciando nueva evaluación Q-CHAT.');
    }
}

function goBack() {
    if (quizState.showingResults || Object.keys(quizState.answers).length === 0) {
        // Si estamos en resultados o no hay respuestas, volver directamente
        window.location.href = '../index.html';
    } else {
        // Si hay progreso, confirmar
        if (confirm('¿Estás seguro de que quieres salir? Se perderá el progreso actual de la evaluación.')) {
            window.location.href = '../index.html';
        }
    }
}

// === FUNCIONES DE AUDIO ===

function speakText(text) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel(); // Cancelar cualquier speech en curso
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        speechSynthesis.speak(utterance);
    }
}

function playSelectionSound() {
    playSound(800, 0.1, 'sine');
}

function playNavigationSound() {
    playSound(600, 0.15, 'sine');
}

function playSound(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log('Audio no disponible:', error);
    }
}

// === FUNCIONES DE ALMACENAMIENTO ===

function saveResults(results) {
    try {
        const timestamp = new Date().toISOString();
        const savedResults = {
            timestamp,
            results,
            version: 'Q-CHAT-1.0',
            duration: quizState.endTime - quizState.startTime
        };

        // Guardar en localStorage
        localStorage.setItem('qchat-last-results', JSON.stringify(savedResults));
        
        // Guardar en historial
        const history = JSON.parse(localStorage.getItem('qchat-history') || '[]');
        history.push(savedResults);
        
        // Mantener solo los últimos 5 resultados
        if (history.length > 5) {
            history.splice(0, history.length - 5);
        }
        
        localStorage.setItem('qchat-history', JSON.stringify(history));
        
        console.log('Resultados guardados exitosamente');
    } catch (error) {
        console.error('Error guardando resultados:', error);
    }
}

function loadPreviousResults() {
    try {
        const saved = localStorage.getItem('qchat-last-results');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error cargando resultados previos:', error);
    }
    return null;
}

// === INICIALIZACIÓN ===

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Q-CHAT Quiz inicializado');
    
    // Verificar si hay resultados previos
    const previousResults = loadPreviousResults();
    if (previousResults) {
        const daysSince = Math.floor((Date.now() - new Date(previousResults.timestamp).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince < 30) { // Mostrar notificación si es menor a 30 días
            setTimeout(() => {
                if (confirm(`Se encontró una evaluación previa de hace ${daysSince} días.\n\n¿Quieres ver esos resultados o hacer una nueva evaluación?`)) {
                    // Cargar resultados previos
                    displayResults(previousResults.results, 0);
                    showSection('resultsSection');
                }
            }, 2000);
        }
    }
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        speakText('Bienvenido al Q-CHAT, una herramienta científica de evaluación temprana para niños de 18 a 24 meses.');
    }, 1000);
});

// === MANEJO DE ERRORES ===

window.addEventListener('error', function(e) {
    console.error('Error en Q-CHAT:', e.error);
    alert('Ha ocurrido un error. Por favor, recarga la página e intenta nuevamente.');
});

// Prevenir pérdida de datos al cerrar
window.addEventListener('beforeunload', function(e) {
    if (Object.keys(quizState.answers).length > 0 && !quizState.showingResults) {
        e.preventDefault();
        e.returnValue = 'Tienes una evaluación en progreso. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
    }
});

// === ACCESIBILIDAD ADICIONAL ===

// Navegación por teclado en opciones de respuesta
document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('answer-option')) {
        const options = Array.from(document.querySelectorAll('.answer-option'));
        const currentIndex = options.indexOf(e.target);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < options.length - 1) {
                    options[currentIndex + 1].focus();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    options[currentIndex - 1].focus();
                }
                break;
        }
    }
});

console.log('🧠 Q-CHAT Quiz completamente cargado y listo');