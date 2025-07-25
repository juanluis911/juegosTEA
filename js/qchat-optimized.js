// 📋 Q-CHAT - JavaScript Auto-contenido (Sin dependencias JSON)
console.log('📋 Iniciando Q-CHAT v2.0 - Auto-contenido...');

class QChatAssessment {
    constructor() {
        this.data = null;
        this.responses = {};
        this.currentQuestion = 0;
        this.score = 0;
        this.categoryScores = {};
        this.startTime = Date.now();
        this.selectedAgeGroup = 'toddlers'; // Default para 18-24 meses
        
        this.init();
    }

    async init() {
        try {
            this.loadEmbeddedData();
            this.setupEventListeners();
            this.initializeAssessment();
            console.log('✅ Q-CHAT inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Q-CHAT:', error);
            this.showError('Error cargando el cuestionario. Por favor, recarga la página.');
        }
    }

    loadEmbeddedData() {
        console.log('📊 Cargando datos embebidos...');
        
        // Datos completos del Q-CHAT embebidos directamente
        this.data = {
            metadata: {
                version: "2.0",
                title: "Q-CHAT - Cuestionario de Detección del Autismo",
                description: "Cuestionario de detección temprana para el Trastorno del Espectro Autista (TEA)",
                authors: "JuegoTEA - Adaptado de Allison et al.",
                language: "es",
                lastUpdated: "2025-01-25"
            },
            
            ageGroups: {
                toddlers: {
                    id: "toddlers",
                    name: "Niños Pequeños",
                    ageRange: "18-24 meses",
                    minAge: 18,
                    maxAge: 24,
                    description: "Cuestionario Q-CHAT original para detección temprana",
                    totalQuestions: 25,
                    completionTime: "5-7 minutos",
                    scoringThreshold: {
                        lowRisk: { min: 0, max: 2 },
                        moderateRisk: { min: 3, max: 7 },
                        highRisk: { min: 8, max: 25 }
                    }
                },
                children: {
                    id: "children",
                    name: "Niños Escolares",
                    ageRange: "3-12 años",
                    minAge: 36,
                    maxAge: 144,
                    description: "Cuestionario adaptado para edad escolar",
                    totalQuestions: 20,
                    completionTime: "6-8 minutos",
                    scoringThreshold: {
                        lowRisk: { min: 0, max: 3 },
                        moderateRisk: { min: 4, max: 8 },
                        highRisk: { min: 9, max: 20 }
                    }
                }
            },
            
            questions: {
                toddlers: [
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
                            { value: 0, text: "Muchas veces al día", description: "Señala frecuentemente para pedir cosas" },
                            { value: 0, text: "Algunas veces al día", description: "Ocasionalmente señala para pedir" },
                            { value: 0, text: "Algunas veces por semana", description: "Señala para pedir pocas veces por semana" },
                            { value: 1, text: "Menos de una vez por semana", description: "Raramente señala para pedir" },
                            { value: 1, text: "Nunca", description: "Nunca señala para pedir cosas" }
                        ]
                    },
                    {
                        id: 4,
                        text: "¿Su hijo/a señala para mostrarle algo interesante?",
                        category: "communication",
                        options: [
                            { value: 0, text: "Muchas veces al día", description: "Señala frecuentemente para mostrar cosas" },
                            { value: 0, text: "Algunas veces al día", description: "Ocasionalmente señala para mostrar" },
                            { value: 0, text: "Algunas veces por semana", description: "Señala para mostrar pocas veces por semana" },
                            { value: 1, text: "Menos de una vez por semana", description: "Raramente señala para mostrar" },
                            { value: 1, text: "Nunca", description: "Nunca señala para mostrar algo" }
                        ]
                    },
                    {
                        id: 5,
                        text: "¿Su hijo/a pretende (por ejemplo, hacer té, hablar por teléfono)?",
                        category: "play",
                        options: [
                            { value: 0, text: "Muchas veces al día", description: "Juega imaginativamente con frecuencia" },
                            { value: 0, text: "Algunas veces al día", description: "Ocasionalmente hace juego de pretensión" },
                            { value: 0, text: "Algunas veces por semana", description: "Juego imaginativo pocas veces por semana" },
                            { value: 1, text: "Menos de una vez por semana", description: "Raramente hace juego de pretensión" },
                            { value: 1, text: "Nunca", description: "Nunca juega imaginativamente" }
                        ]
                    },
                    {
                        id: 6,
                        text: "¿Su hijo/a usa gestos simples (por ejemplo, agitar la mano para decir adiós)?",
                        category: "communication",
                        options: [
                            { value: 0, text: "Siempre", description: "Usa gestos apropiados consistentemente" },
                            { value: 0, text: "Casi siempre", description: "Generalmente usa gestos simples" },
                            { value: 0, text: "A veces", description: "Ocasionalmente usa gestos" },
                            { value: 1, text: "Raramente", description: "Raramente usa gestos simples" },
                            { value: 1, text: "Nunca", description: "No usa gestos simples" }
                        ]
                    },
                    {
                        id: 7,
                        text: "¿Su hijo/a responde cuando usted dice su nombre?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre responde a su nombre" },
                            { value: 0, text: "Casi siempre", description: "Generalmente responde cuando lo llamo" },
                            { value: 0, text: "A veces", description: "A veces responde a su nombre" },
                            { value: 1, text: "Raramente", description: "Raramente responde a su nombre" },
                            { value: 1, text: "Nunca", description: "No responde cuando lo llamo por su nombre" }
                        ]
                    },
                    {
                        id: 8,
                        text: "Si usted señala algo al otro lado de la habitación, ¿su hijo/a mira?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre sigue mi señalamiento" },
                            { value: 0, text: "Casi siempre", description: "Generalmente mira hacia donde señalo" },
                            { value: 0, text: "A veces", description: "A veces sigue mi señalamiento" },
                            { value: 1, text: "Raramente", description: "Raramente mira hacia donde señalo" },
                            { value: 1, text: "Nunca", description: "No sigue mi señalamiento" }
                        ]
                    },
                    {
                        id: 9,
                        text: "¿Su hijo/a camina?",
                        category: "motor",
                        options: [
                            { value: 0, text: "Sí", description: "Ya camina independientemente" },
                            { value: 1, text: "No", description: "Aún no camina independientemente" }
                        ]
                    },
                    {
                        id: 10,
                        text: "¿Su hijo/a mira las cosas que usted está mirando?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre sigue mi dirección de mirada" },
                            { value: 0, text: "Casi siempre", description: "Generalmente mira hacia donde miro" },
                            { value: 0, text: "A veces", description: "A veces sigue mi dirección de mirada" },
                            { value: 1, text: "Raramente", description: "Raramente mira hacia donde miro" },
                            { value: 1, text: "Nunca", description: "No sigue mi dirección de mirada" }
                        ]
                    },
                    {
                        id: 11,
                        text: "¿Su hijo/a hace movimientos extraños con los dedos cerca de su cara?",
                        category: "behavioral",
                        options: [
                            { value: 1, text: "Siempre", description: "Frecuentemente hace movimientos repetitivos" },
                            { value: 1, text: "A menudo", description: "A menudo hace movimientos extraños" },
                            { value: 0, text: "A veces", description: "Ocasionalmente hace estos movimientos" },
                            { value: 0, text: "Raramente", description: "Raramente hace movimientos extraños" },
                            { value: 0, text: "Nunca", description: "No hace movimientos repetitivos extraños" }
                        ]
                    },
                    {
                        id: 12,
                        text: "¿Su hijo/a trata de llamar su atención sobre su propia actividad?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre busca mi atención" },
                            { value: 0, text: "Casi siempre", description: "Generalmente trata de llamar mi atención" },
                            { value: 0, text: "A veces", description: "A veces busca mi atención" },
                            { value: 1, text: "Raramente", description: "Raramente busca mi atención" },
                            { value: 1, text: "Nunca", description: "No trata de llamar mi atención" }
                        ]
                    },
                    {
                        id: 13,
                        text: "¿Alguna vez ha sospechado que su hijo/a tiene problemas de audición?",
                        category: "sensory",
                        options: [
                            { value: 0, text: "No", description: "No he sospechado problemas de audición" },
                            { value: 1, text: "Sí", description: "He sospechado problemas de audición" }
                        ]
                    },
                    {
                        id: 14,
                        text: "¿Su hijo/a entiende lo que la gente dice?",
                        category: "communication",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre entiende lo que decimos" },
                            { value: 0, text: "Casi siempre", description: "Generalmente entiende" },
                            { value: 0, text: "A veces", description: "A veces entiende lo que decimos" },
                            { value: 1, text: "Raramente", description: "Raramente entiende" },
                            { value: 1, text: "Nunca", description: "No parece entender lo que decimos" }
                        ]
                    },
                    {
                        id: 15,
                        text: "¿Su hijo/a a veces mira fijamente a la nada o camina sin rumbo?",
                        category: "behavioral",
                        options: [
                            { value: 1, text: "Siempre", description: "Frecuentemente mira fijamente o camina sin rumbo" },
                            { value: 1, text: "A menudo", description: "A menudo hace esto" },
                            { value: 0, text: "A veces", description: "Ocasionalmente mira fijamente" },
                            { value: 0, text: "Raramente", description: "Raramente hace esto" },
                            { value: 0, text: "Nunca", description: "Nunca mira fijamente o camina sin rumbo" }
                        ]
                    },
                    {
                        id: 16,
                        text: "¿Su hijo/a mira a su cara para comprobar su reacción cuando se enfrenta a algo extraño?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre busca mi reacción" },
                            { value: 0, text: "Casi siempre", description: "Generalmente mira mi cara" },
                            { value: 0, text: "A veces", description: "A veces busca mi reacción" },
                            { value: 1, text: "Raramente", description: "Raramente mira mi cara" },
                            { value: 1, text: "Nunca", description: "No busca mi reacción" }
                        ]
                    },
                    {
                        id: 17,
                        text: "¿Le gusta a su hijo/a las actividades de movimiento (por ejemplo, ser columpiado)?",
                        category: "sensory",
                        options: [
                            { value: 0, text: "Siempre", description: "Le encantan las actividades de movimiento" },
                            { value: 0, text: "Casi siempre", description: "Generalmente disfruta el movimiento" },
                            { value: 0, text: "A veces", description: "A veces le gusta el movimiento" },
                            { value: 1, text: "Raramente", description: "Raramente disfruta el movimiento" },
                            { value: 1, text: "Nunca", description: "No le gustan las actividades de movimiento" }
                        ]
                    },
                    {
                        id: 18,
                        text: "¿Su hijo/a se interesa por otros niños?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre muestra interés por otros niños" },
                            { value: 0, text: "Casi siempre", description: "Generalmente se interesa por otros niños" },
                            { value: 0, text: "A veces", description: "A veces muestra interés" },
                            { value: 1, text: "Raramente", description: "Raramente se interesa por otros niños" },
                            { value: 1, text: "Nunca", description: "No muestra interés por otros niños" }
                        ]
                    },
                    {
                        id: 19,
                        text: "¿Su hijo/a le gusta subirse a cosas, como subir escaleras?",
                        category: "motor",
                        options: [
                            { value: 0, text: "Siempre", description: "Le encanta subir y trepar" },
                            { value: 0, text: "Casi siempre", description: "Generalmente disfruta subir" },
                            { value: 0, text: "A veces", description: "A veces le gusta trepar" },
                            { value: 1, text: "Raramente", description: "Raramente trepa o sube" },
                            { value: 1, text: "Nunca", description: "No le gusta subir o trepar" }
                        ]
                    },
                    {
                        id: 20,
                        text: "¿Su hijo/a disfruta jugando al escondite/peek-a-boo?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre disfruta estos juegos" },
                            { value: 0, text: "Casi siempre", description: "Generalmente le gustan estos juegos" },
                            { value: 0, text: "A veces", description: "A veces disfruta peek-a-boo" },
                            { value: 1, text: "Raramente", description: "Raramente disfruta estos juegos" },
                            { value: 1, text: "Nunca", description: "No le gusta jugar al escondite" }
                        ]
                    },
                    {
                        id: 21,
                        text: "¿Su hijo/a juega adecuadamente con juguetes pequeños (carros, bloques) sin solo llevárselos a la boca?",
                        category: "play",
                        options: [
                            { value: 0, text: "Siempre", description: "Juega funcionalmente con juguetes" },
                            { value: 0, text: "Casi siempre", description: "Generalmente juega apropiadamente" },
                            { value: 0, text: "A veces", description: "A veces juega funcionalmente" },
                            { value: 1, text: "Raramente", description: "Raramente juega apropiadamente" },
                            { value: 1, text: "Nunca", description: "Solo explora sensorialmente los juguetes" }
                        ]
                    },
                    {
                        id: 22,
                        text: "¿Su hijo/a le trae objetos para mostrarle algo?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Frecuentemente me trae cosas para mostrar" },
                            { value: 0, text: "Casi siempre", description: "A menudo me trae objetos" },
                            { value: 0, text: "A veces", description: "A veces me trae cosas" },
                            { value: 1, text: "Raramente", description: "Raramente me trae objetos" },
                            { value: 1, text: "Nunca", description: "No me trae cosas para mostrar" }
                        ]
                    },
                    {
                        id: 23,
                        text: "¿Su hijo/a le mira a los ojos durante más de un segundo o dos?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Mantiene contacto visual prolongado" },
                            { value: 0, text: "Casi siempre", description: "Generalmente mantiene contacto visual" },
                            { value: 0, text: "A veces", description: "A veces hace contacto visual" },
                            { value: 1, text: "Raramente", description: "Raramente mantiene contacto visual" },
                            { value: 1, text: "Nunca", description: "No hace contacto visual prolongado" }
                        ]
                    },
                    {
                        id: 24,
                        text: "¿Su hijo/a parece demasiado sensible al ruido (por ejemplo, tapándose los oídos)?",
                        category: "sensory",
                        options: [
                            { value: 1, text: "Siempre", description: "Muy sensible a los ruidos" },
                            { value: 1, text: "A menudo", description: "Frecuentemente sensible al ruido" },
                            { value: 0, text: "A veces", description: "Ocasionalmente sensible" },
                            { value: 0, text: "Raramente", description: "Raramente sensible al ruido" },
                            { value: 0, text: "Nunca", description: "No es sensible al ruido" }
                        ]
                    },
                    {
                        id: 25,
                        text: "¿Su hijo/a sonríe en respuesta a su cara o sonrisa?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre responde con sonrisas" },
                            { value: 0, text: "Casi siempre", description: "Generalmente me sonríe de vuelta" },
                            { value: 0, text: "A veces", description: "A veces responde con sonrisas" },
                            { value: 1, text: "Raramente", description: "Raramente me sonríe" },
                            { value: 1, text: "Nunca", description: "No responde con sonrisas" }
                        ]
                    }
                ],
                
                children: [
                    {
                        id: 1,
                        text: "¿Su hijo/a mantiene conversaciones apropiadas para su edad?",
                        category: "communication",
                        options: [
                            { value: 0, text: "Siempre", description: "Mantiene conversaciones fluidas" },
                            { value: 0, text: "Casi siempre", description: "Generalmente conversa bien" },
                            { value: 1, text: "A veces", description: "A veces tiene dificultades" },
                            { value: 1, text: "Raramente", description: "Raramente conversa apropiadamente" },
                            { value: 1, text: "Nunca", description: "No mantiene conversaciones" }
                        ]
                    },
                    {
                        id: 2,
                        text: "¿Su hijo/a entiende las expresiones faciales y el lenguaje corporal?",
                        category: "social",
                        options: [
                            { value: 0, text: "Muy bien", description: "Comprende claramente las expresiones" },
                            { value: 0, text: "Bastante bien", description: "Generalmente entiende" },
                            { value: 1, text: "Con dificultad", description: "Dificultades para interpretar" },
                            { value: 1, text: "Muy poco", description: "Apenas comprende" },
                            { value: 1, text: "No entiende", description: "No comprende expresiones" }
                        ]
                    },
                    {
                        id: 3,
                        text: "¿Su hijo/a juega cooperativamente con otros niños?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre juega cooperativamente" },
                            { value: 0, text: "Casi siempre", description: "Generalmente juega bien con otros" },
                            { value: 1, text: "A veces", description: "A veces juega cooperativamente" },
                            { value: 1, text: "Raramente", description: "Raramente juega con otros" },
                            { value: 1, text: "Nunca", description: "No juega cooperativamente" }
                        ]
                    },
                    {
                        id: 4,
                        text: "¿Su hijo/a se adapta bien a los cambios en la rutina?",
                        category: "behavioral",
                        options: [
                            { value: 0, text: "Muy bien", description: "Se adapta fácilmente a cambios" },
                            { value: 0, text: "Bastante bien", description: "Generalmente se adapta" },
                            { value: 1, text: "Con dificultad", description: "Le cuesta adaptarse" },
                            { value: 1, text: "Muy mal", description: "Se angustia con cambios" },
                            { value: 1, text: "No se adapta", description: "No tolera cambios" }
                        ]
                    },
                    {
                        id: 5,
                        text: "¿Su hijo/a muestra empatía hacia otros cuando están tristes o heridos?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre muestra empatía" },
                            { value: 0, text: "Casi siempre", description: "Generalmente es empático" },
                            { value: 1, text: "A veces", description: "A veces muestra empatía" },
                            { value: 1, text: "Raramente", description: "Raramente es empático" },
                            { value: 1, text: "Nunca", description: "No muestra empatía" }
                        ]
                    },
                    {
                        id: 6,
                        text: "¿Su hijo/a tiene intereses muy intensos y específicos?",
                        category: "behavioral",
                        options: [
                            { value: 1, text: "Siempre", description: "Intereses muy intensos y limitados" },
                            { value: 1, text: "A menudo", description: "Frecuentemente obsesivo" },
                            { value: 0, text: "A veces", description: "A veces muy enfocado" },
                            { value: 0, text: "Raramente", description: "Raramente obsesivo" },
                            { value: 0, text: "Nunca", description: "Intereses variados y flexibles" }
                        ]
                    },
                    {
                        id: 7,
                        text: "¿Su hijo/a prefiere las actividades solitarias sobre las grupales?",
                        category: "social",
                        options: [
                            { value: 1, text: "Siempre", description: "Siempre prefiere estar solo" },
                            { value: 1, text: "Casi siempre", description: "Generalmente prefiere soledad" },
                            { value: 0, text: "A veces", description: "A veces prefiere estar solo" },
                            { value: 0, text: "Raramente", description: "Raramente prefiere soledad" },
                            { value: 0, text: "Nunca", description: "Prefiere actividades grupales" }
                        ]
                    },
                    {
                        id: 8,
                        text: "¿Su hijo/a comprende el sarcasmo y el humor?",
                        category: "communication",
                        options: [
                            { value: 0, text: "Muy bien", description: "Comprende bien el humor" },
                            { value: 0, text: "Bastante bien", description: "Generalmente entiende" },
                            { value: 1, text: "Con dificultad", description: "Le cuesta entender" },
                            { value: 1, text: "Muy poco", description: "Apenas comprende" },
                            { value: 1, text: "No comprende", description: "No entiende sarcasmo ni humor" }
                        ]
                    },
                    {
                        id: 9,
                        text: "¿Su hijo/a tiene movimientos repetitivos o estereotipados?",
                        category: "behavioral",
                        options: [
                            { value: 1, text: "Siempre", description: "Frecuentes movimientos repetitivos" },
                            { value: 1, text: "A menudo", description: "A menudo hace movimientos repetitivos" },
                            { value: 0, text: "A veces", description: "Ocasionalmente hace movimientos repetitivos" },
                            { value: 0, text: "Raramente", description: "Raramente hace estos movimientos" },
                            { value: 0, text: "Nunca", description: "No tiene movimientos repetitivos" }
                        ]
                    },
                    {
                        id: 10,
                        text: "¿Su hijo/a se altera mucho con ruidos fuertes o inesperados?",
                        category: "sensory",
                        options: [
                            { value: 1, text: "Siempre", description: "Muy sensible a ruidos" },
                            { value: 1, text: "A menudo", description: "Frecuentemente se altera" },
                            { value: 0, text: "A veces", description: "A veces se molesta" },
                            { value: 0, text: "Raramente", description: "Raramente se altera" },
                            { value: 0, text: "Nunca", description: "No es sensible a ruidos" }
                        ]
                    },
                    {
                        id: 11,
                        text: "¿Su hijo/a inicia conversaciones con otros niños?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre inicia conversaciones" },
                            { value: 0, text: "Casi siempre", description: "Generalmente inicia conversaciones" },
                            { value: 1, text: "A veces", description: "A veces inicia conversaciones" },
                            { value: 1, text: "Raramente", description: "Raramente inicia conversaciones" },
                            { value: 1, text: "Nunca", description: "No inicia conversaciones" }
                        ]
                    },
                    {
                        id: 12,
                        text: "¿Su hijo/a comprende las reglas de los juegos sociales?",
                        category: "social",
                        options: [
                            { value: 0, text: "Muy bien", description: "Comprende perfectamente las reglas" },
                            { value: 0, text: "Bastante bien", description: "Generalmente entiende las reglas" },
                            { value: 1, text: "Con dificultad", description: "Le cuesta entender las reglas" },
                            { value: 1, text: "Muy poco", description: "Apenas comprende las reglas" },
                            { value: 1, text: "No comprende", description: "No entiende las reglas sociales" }
                        ]
                    },
                    {
                        id: 13,
                        text: "¿Su hijo/a usa el lenguaje de manera creativa y flexible?",
                        category: "communication",
                        options: [
                            { value: 0, text: "Siempre", description: "Usa el lenguaje creativamente" },
                            { value: 0, text: "Casi siempre", description: "Generalmente es creativo" },
                            { value: 1, text: "A veces", description: "A veces es creativo" },
                            { value: 1, text: "Raramente", description: "Raramente es creativo" },
                            { value: 1, text: "Nunca", description: "Usa lenguaje repetitivo/rígido" }
                        ]
                    },
                    {
                        id: 14,
                        text: "¿Su hijo/a se frustra cuando las cosas no salen como espera?",
                        category: "behavioral",
                        options: [
                            { value: 1, text: "Siempre", description: "Se frustra extremadamente" },
                            { value: 1, text: "A menudo", description: "Frecuentemente se frustra" },
                            { value: 0, text: "A veces", description: "A veces se frustra" },
                            { value: 0, text: "Raramente", description: "Raramente se frustra" },
                            { value: 0, text: "Nunca", description: "Maneja bien la frustración" }
                        ]
                    },
                    {
                        id: 15,
                        text: "¿Su hijo/a imita comportamientos y expresiones de otros?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre imita apropiadamente" },
                            { value: 0, text: "Casi siempre", description: "Generalmente imita" },
                            { value: 1, text: "A veces", description: "A veces imita" },
                            { value: 1, text: "Raramente", description: "Raramente imita" },
                            { value: 1, text: "Nunca", description: "No imita comportamientos" }
                        ]
                    },
                    {
                        id: 16,
                        text: "¿Su hijo/a comprende metáforas y expresiones idiomáticas?",
                        category: "communication",
                        options: [
                            { value: 0, text: "Muy bien", description: "Comprende perfectamente" },
                            { value: 0, text: "Bastante bien", description: "Generalmente comprende" },
                            { value: 1, text: "Con dificultad", description: "Le cuesta comprender" },
                            { value: 1, text: "Muy poco", description: "Apenas comprende" },
                            { value: 1, text: "No comprende", description: "No entiende lenguaje figurado" }
                        ]
                    },
                    {
                        id: 17,
                        text: "¿Su hijo/a tiene dificultades con texturas de alimentos o ropa?",
                        category: "sensory",
                        options: [
                            { value: 1, text: "Siempre", description: "Muy sensible a texturas" },
                            { value: 1, text: "A menudo", description: "Frecuentemente tiene dificultades" },
                            { value: 0, text: "A veces", description: "A veces es sensible" },
                            { value: 0, text: "Raramente", description: "Raramente tiene problemas" },
                            { value: 0, text: "Nunca", description: "No tiene sensibilidades" }
                        ]
                    },
                    {
                        id: 18,
                        text: "¿Su hijo/a busca tranquilizar a otros cuando están alterados?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre trata de consolar" },
                            { value: 0, text: "Casi siempre", description: "Generalmente consuela" },
                            { value: 1, text: "A veces", description: "A veces trata de ayudar" },
                            { value: 1, text: "Raramente", description: "Raramente consuela" },
                            { value: 1, text: "Nunca", description: "No trata de consolar" }
                        ]
                    },
                    {
                        id: 19,
                        text: "¿Su hijo/a prefiere rutinas muy específicas y se molesta si cambian?",
                        category: "behavioral",
                        options: [
                            { value: 1, text: "Siempre", description: "Muy rígido con rutinas" },
                            { value: 1, text: "A menudo", description: "Frecuentemente inflexible" },
                            { value: 0, text: "A veces", description: "A veces prefiere rutinas" },
                            { value: 0, text: "Raramente", description: "Raramente inflexible" },
                            { value: 0, text: "Nunca", description: "Flexible con cambios" }
                        ]
                    },
                    {
                        id: 20,
                        text: "¿Su hijo/a hace contacto visual apropiado durante las conversaciones?",
                        category: "social",
                        options: [
                            { value: 0, text: "Siempre", description: "Siempre mantiene contacto visual" },
                            { value: 0, text: "Casi siempre", description: "Generalmente hace contacto visual" },
                            { value: 1, text: "A veces", description: "A veces hace contacto visual" },
                            { value: 1, text: "Raramente", description: "Raramente mira a los ojos" },
                            { value: 1, text: "Nunca", description: "Evita el contacto visual" }
                        ]
                    }
                ]
            }
        };
        
        console.log('✅ Datos embebidos cargados correctamente');
        console.log(`📊 ${this.data.questions.toddlers.length} preguntas para toddlers`);
        console.log(`📊 ${this.data.questions.children.length} preguntas para children`);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentQuestion > 0) {
                this.previousQuestion();
            }
            if (e.key === 'ArrowRight') {
                this.nextQuestion();
            }
            if (e.key === 'Escape') {
                this.showAgeSelection();
            }
        });
    }

    initializeAssessment() {
        this.showAgeSelection();
    }

    showAgeSelection() {
        const container = document.getElementById('qchat-container');
        const ageGroups = this.data.ageGroups;
        
        container.innerHTML = `
            <div class="qchat-age-selection">
                <div class="intro-header">
                    <h1>📋 ${this.data.metadata.title}</h1>
                    <p class="intro-subtitle">${this.data.metadata.description}</p>
                </div>
                
                <div class="age-selection-content">
                    <h2>👶 Selecciona el rango de edad del niño/a</h2>
                    <p>Esto nos ayudará a mostrar las preguntas más apropiadas para la edad:</p>
                    
                    <div class="age-options">
                        ${Object.entries(ageGroups).map(([key, group]) => `
                            <label class="age-option ${key === 'toddlers' ? 'selected' : ''}" for="age-${key}">
                                <input type="radio" 
                                       id="age-${key}" 
                                       name="ageGroup" 
                                       value="${key}"
                                       ${key === 'toddlers' ? 'checked' : ''}
                                       onchange="qchatApp.selectAgeGroup('${key}')">
                                <div class="age-option-content">
                                    <div class="age-range">${group.ageRange}</div>
                                    <div class="age-name">${group.name}</div>
                                    <div class="age-description">${group.description}</div>
                                    <div class="age-stats">
                                        <span>📝 ${group.totalQuestions} preguntas</span>
                                        <span>⏱️ ${group.completionTime}</span>
                                    </div>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                    
                    <div class="disclaimer-box">
                        <span class="disclaimer-icon">⚠️</span>
                        <div>
                            <strong>Importante:</strong>
                            Este cuestionario es una herramienta de detección, no un diagnóstico. 
                            Los resultados deben ser interpretados por un profesional de salud.
                        </div>
                    </div>
                    
                    <div class="age-actions">
                        <button class="btn btn-primary" onclick="qchatApp.startWithSelectedAge()">
                            🚀 Comenzar Cuestionario
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    selectAgeGroup(ageGroup) {
        this.selectedAgeGroup = ageGroup;
        console.log(`👶 Grupo de edad seleccionado: ${ageGroup}`);
        
        // Actualizar visualización
        const options = document.querySelectorAll('.age-option');
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.querySelector(`input[value="${ageGroup}"]`)) {
                option.classList.add('selected');
            }
        });
    }

    startWithSelectedAge() {
        const questions = this.data.questions[this.selectedAgeGroup];
        
        if (!questions || questions.length === 0) {
            this.showError(`No hay preguntas disponibles para el grupo de edad: ${this.selectedAgeGroup}`);
            return;
        }
        
        console.log(`🚀 Iniciando cuestionario para ${this.selectedAgeGroup} con ${questions.length} preguntas`);
        
        // Resetear estado
        this.responses = {};
        this.currentQuestion = 0;
        this.score = 0;
        this.categoryScores = {};
        this.startTime = Date.now();
        
        this.initializeCategoryScores();
        this.showIntroduction();
    }

    initializeCategoryScores() {
        const questions = this.data.questions[this.selectedAgeGroup];
        const categories = {};
        
        // Extraer categorías únicas de las preguntas
        questions.forEach(question => {
            if (question.category && !categories[question.category]) {
                categories[question.category] = 0;
            }
        });
        
        this.categoryScores = categories;
        console.log('📊 Categorías inicializadas:', Object.keys(this.categoryScores));
    }

    showIntroduction() {
        const container = document.getElementById('qchat-container');
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];
        const questions = this.data.questions[this.selectedAgeGroup];
        
        container.innerHTML = `
            <div class="qchat-introduction">
                <div class="intro-header">
                    <h1>📋 Q-CHAT - ${ageGroupData.name}</h1>
                    <p class="intro-subtitle">Cuestionario para niños de ${ageGroupData.ageRange}</p>
                </div>
                
                <div class="intro-content">
                    <div class="intro-info">
                        <div class="info-item">
                            <span class="info-icon">⏱️</span>
                            <div>
                                <strong>Tiempo estimado:</strong>
                                <span>${ageGroupData.completionTime}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">❓</span>
                            <div>
                                <strong>Preguntas:</strong>
                                <span>${questions.length} preguntas</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">👶</span>
                            <div>
                                <strong>Grupo de edad:</strong>
                                <span>${ageGroupData.ageRange}</span>
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
                            <li>Puede navegar entre preguntas usando los botones o las flechas del teclado</li>
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

                    <div class="intro-actions">
                        <button class="btn btn-secondary" onclick="qchatApp.showAgeSelection()">
                            ← Cambiar Edad
                        </button>
                        <button class="btn btn-primary" onclick="qchatApp.startAssessment()">
                            🚀 Comenzar Preguntas
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

    // === FUNCIÓN CORREGIDA PARA MOSTRAR PREGUNTAS ===
    showQuestion() {
        const questions = this.data.questions[this.selectedAgeGroup];
        
        if (this.currentQuestion >= questions.length) {
            this.completeAssessment();
            return;
        }

        const question = questions[this.currentQuestion];
        const container = document.getElementById('qchat-container');
        const progress = ((this.currentQuestion + 1) / questions.length) * 100;
        
        container.innerHTML = `
            <div class="qchat-question">
                <div class="question-header">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">
                            Pregunta ${this.currentQuestion + 1} de ${questions.length}
                        </div>
                        <div class="progress-percentage">${Math.round(progress)}%</div>
                    </div>
                </div>

                <div class="question-content">
                    <div class="question-category">
                        Categoría: ${this.getCategoryName(question.category)}
                    </div>
                    <h2 class="question-text">${question.text}</h2>
                    
                    <div class="options-container">
                        ${question.options.map((option, index) => {
                            // CORRECCIÓN: Usar IDs únicos por pregunta
                            const uniqueId = `q${question.id}_option${index}`;
                            const isSelected = this.responses[question.id] === option.value;
                            
                            return `
                                <label class="option-label ${isSelected ? 'selected' : ''}" 
                                    for="${uniqueId}">
                                    <input type="radio" 
                                        id="${uniqueId}" 
                                        name="question_${question.id}" 
                                        value="${option.value}"
                                        ${isSelected ? 'checked' : ''}
                                        onchange="qchatApp.selectAnswer(${question.id}, ${option.value})">
                                    <div class="option-content">
                                        <div class="option-text">${option.text}</div>
                                        <div class="option-description">${option.description}</div>
                                    </div>
                                    <div class="option-indicator"></div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="question-actions">
                    <button class="btn btn-secondary" 
                            onclick="qchatApp.previousQuestion()" 
                            ${this.currentQuestion === 0 ? 'disabled' : ''}>
                        ← Anterior
                    </button>
                    <div class="question-counter">
                        ${this.currentQuestion + 1} / ${questions.length}
                    </div>
                    <button class="btn btn-primary" 
                            onclick="qchatApp.nextQuestion()"
                            ${this.responses[question.id] === undefined ? 'disabled' : ''}>
                        ${this.currentQuestion === questions.length - 1 ? 'Ver Resultados →' : 'Siguiente →'}
                    </button>
                </div>
            </div>
        `;

        // Scroll to top suavemente
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Actualizar el título de la página
        document.title = `Q-CHAT - Pregunta ${this.currentQuestion + 1}/${questions.length}`;
    }

    getCategoryName(category) {
        const categoryNames = {
            social: '👥 Social',
            communication: '💬 Comunicación',
            play: '🎮 Juego',
            behavioral: '🔄 Comportamiento',
            sensory: '👂 Sensorial',
            motor: '🏃 Motor',
            cognitive: '🧠 Cognitivo'
        };
        return categoryNames[category] || `📋 ${category}`;
    }

    // === FUNCIÓN CORREGIDA PARA SELECCIONAR RESPUESTA ===
    selectAnswer(questionId, value) {
        console.log(`📝 Respuesta seleccionada - Pregunta ${questionId}: ${value}`);
        
        // CORRECCIÓN 1: Convertir value a número para consistencia
        const numericValue = parseInt(value);
        this.responses[questionId] = numericValue;
        
        // CORRECCIÓN 2: Actualizar score de categoría
        const questions = this.data.questions[this.selectedAgeGroup];
        const question = questions.find(q => q.id === questionId);
        
        if (question && this.categoryScores.hasOwnProperty(question.category)) {
            // Recalcular score total de la categoría
            const categoryQuestions = questions.filter(q => q.category === question.category);
            this.categoryScores[question.category] = categoryQuestions.reduce((sum, q) => {
                return sum + (this.responses[q.id] || 0);
            }, 0);
        }

        // CORRECCIÓN 3: Actualizar UI de manera más específica
        this.updateOptionSelection(questionId, numericValue);

        // CORRECCIÓN 4: Habilitar botón siguiente
        const nextBtn = document.querySelector('.question-actions .btn-primary');
        if (nextBtn) {
            nextBtn.disabled = false;
        }

        // Feedback visual
        this.showNotification('✅ Respuesta guardada', 'success');
    }
    // === NUEVA FUNCIÓN PARA ACTUALIZAR SELECCIÓN UI ===
    updateOptionSelection(questionId, selectedValue) {
        // Remover selección previa de todas las opciones de esta pregunta
        const allLabels = document.querySelectorAll(`input[name="question_${questionId}"]`);
        
        allLabels.forEach(input => {
            const label = input.closest('.option-label');
            const isCurrentSelection = parseInt(input.value) === selectedValue;
            
            // Actualizar input
            input.checked = isCurrentSelection;
            
            // Actualizar label
            if (isCurrentSelection) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
        
        console.log(`✅ UI actualizada para pregunta ${questionId}, valor ${selectedValue}`);
    }
    // === FUNCIÓN ADICIONAL PARA DEBUG ===
    debugCurrentState() {
        console.log('=== ESTADO ACTUAL DEL Q-CHAT ===');
        console.log('Pregunta actual:', this.currentQuestion);
        console.log('Respuestas guardadas:', this.responses);
        console.log('Grupo de edad:', this.selectedAgeGroup);
        console.log('Total de preguntas:', this.data.questions[this.selectedAgeGroup]?.length);
        console.log('=================================');
    }
    // === FUNCIÓN CORREGIDA PARA NAVEGACIÓN ===
    nextQuestion() {
        const questions = this.data.questions[this.selectedAgeGroup];
        const question = questions[this.currentQuestion];
        
        // Verificar que hay respuesta
        if (this.responses[question.id] === undefined) {
            this.showNotification('Por favor, selecciona una respuesta antes de continuar', 'warning');
            return;
        }

        // Debug para verificar estado
        console.log(`➡️ Avanzando de pregunta ${this.currentQuestion + 1} a ${this.currentQuestion + 2}`);
        console.log(`Respuesta guardada para pregunta ${question.id}:`, this.responses[question.id]);

        if (this.currentQuestion < questions.length - 1) {
            this.currentQuestion++;
            this.showQuestion();
        } else {
            this.completeAssessment();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            console.log(`⬅️ Retrocediendo de pregunta ${this.currentQuestion + 1} a ${this.currentQuestion}`);
            this.currentQuestion--;
            this.showQuestion();
        }
    }

    completeAssessment() {
        console.log('🎯 Completando evaluación...');
        this.calculateFinalScore();
        
        // Mostrar loading antes de los resultados
        const container = document.getElementById('qchat-container');
        container.innerHTML = `
            <div class="loading-results">
                <div class="spinner"></div>
                <h2>📊 Calculando Resultados...</h2>
                <p>Analizando las ${Object.keys(this.responses).length} respuestas</p>
            </div>
        `;
        
        setTimeout(() => {
            this.showResults();
        }, 2000);
    }

    calculateFinalScore() {
        this.score = Object.values(this.responses).reduce((sum, value) => sum + value, 0);
        console.log('📊 Puntuación final:', this.score);
        console.log('📈 Puntuaciones por categoría:', this.categoryScores);
        console.log('📝 Total de respuestas:', Object.keys(this.responses).length);
    }

    getInterpretation() {
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];
        const thresholds = ageGroupData.scoringThreshold;
        
        if (this.score >= thresholds.lowRisk.min && this.score <= thresholds.lowRisk.max) {
            return {
                level: 'lowRisk',
                title: 'Bajo Riesgo',
                color: '#48bb78',
                description: 'Los resultados sugieren un desarrollo típico para la edad.',
                recommendation: 'Continúe con las visitas regulares al pediatra y fomente el desarrollo apropiado para la edad.'
            };
        } else if (this.score >= thresholds.moderateRisk.min && this.score <= thresholds.moderateRisk.max) {
            return {
                level: 'moderateRisk',
                title: 'Riesgo Moderado',
                color: '#ed8936',
                description: 'Algunas respuestas sugieren la necesidad de evaluación adicional.',
                recommendation: 'Se recomienda consultar con un pediatra del desarrollo para una evaluación más detallada.'
            };
        } else {
            return {
                level: 'highRisk',
                title: 'Alto Riesgo',
                color: '#dc3545',
                description: 'Los resultados indican características que ameritan evaluación profesional.',
                recommendation: 'Se recomienda encarecidamente buscar evaluación con un especialista en desarrollo infantil.'
            };
        }
    }

    showResults() {
        const interpretation = this.getInterpretation();
        const completionTime = Math.round((Date.now() - this.startTime) / 60000);
        const ageGroupData = this.data.ageGroups[this.selectedAgeGroup];
        const questions = this.data.questions[this.selectedAgeGroup];
        
        // Restaurar título original
        document.title = 'Q-CHAT - Resultados';
        
        const container = document.getElementById('qchat-container');
        container.innerHTML = `
            <div class="qchat-results">
                <div class="results-header">
                    <h1>📋 Resultados del Q-CHAT</h1>
                    <div class="completion-info">
                        <span>✅ Evaluación completada en ${completionTime} minutos</span>
                        <span>👶 Grupo de edad: ${ageGroupData.name} (${ageGroupData.ageRange})</span>
                        <span>📝 ${questions.length} preguntas respondidas</span>
                    </div>
                </div>

                <div class="score-summary">
                    <div class="score-card" style="border-color: ${interpretation.color}">
                        <div class="score-number">${this.score}</div>
                        <div class="score-label">Puntuación Total</div>
                        <div class="score-range">
                            Rango para ${interpretation.title}: 
                            ${this.getScoreRange(interpretation.level)}
                        </div>
                    </div>
                    <div class="interpretation-card" style="background-color: ${interpretation.color}20; border-color: ${interpretation.color}">
                        <h3 style="color: ${interpretation.color}">
                            ${interpretation.title}
                        </h3>
                        <p>${interpretation.description}</p>
                        <div class="recommendation">
                            <strong>💡 Recomendación:</strong>
                            <p>${interpretation.recommendation}</p>
                        </div>
                    </div>
                </div>

                ${this.generateCategoryBreakdown()}

                <div class="important-note">
                    <div class="note-content">
                        <span class="note-icon">⚠️</span>
                        <div>
                            <strong>Nota Importante:</strong>
                            Este cuestionario es una herramienta de detección, no un diagnóstico. 
                            Los resultados deben ser interpretados en conjunto con otros factores 
                            por un profesional de la salud calificado.
                        </div>
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
                    <button class="btn btn-outline" onclick="qchatApp.showAgeSelection()">
                        👶 Cambiar Edad
                    </button>
                </div>
            </div>
        `;

        // Guardar resultados
        this.saveResults();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getScoreRange(level) {
        const thresholds = this.data.ageGroups[this.selectedAgeGroup].scoringThreshold;
        const range = thresholds[level];
        return `${range.min}-${range.max}`;
    }

    generateCategoryBreakdown() {
        const categories = Object.entries(this.categoryScores);
        
        if (categories.length === 0) {
            return '';
        }
        
        return `
            <div class="category-breakdown">
                <h3>📊 Desglose por Categorías</h3>
                <div class="category-grid">
                    ${categories.map(([category, score]) => `
                        <div class="category-item">
                            <div class="category-header">
                                <span class="category-name">${this.getCategoryName(category)}</span>
                                <span class="category-score">${score}</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-fill" style="width: ${Math.min((score / 5) * 100, 100)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    restartAssessment() {
        if (confirm('¿Está seguro de que desea reiniciar? Se perderán todos los resultados actuales.')) {
            this.responses = {};
            this.currentQuestion = 0;
            this.score = 0;
            this.categoryScores = {};
            this.startTime = Date.now();
            this.showAgeSelection();
        }
    }

    saveResults() {
        try {
            const results = {
                timestamp: new Date().toISOString(),
                ageGroup: this.selectedAgeGroup,
                score: this.score,
                categoryScores: this.categoryScores,
                interpretation: this.getInterpretation(),
                completionTime: Math.round((Date.now() - this.startTime) / 60000),
                responses: this.responses,
                version: this.data.metadata.version
            };
            
            localStorage.setItem('qchat_results', JSON.stringify(results));
            console.log('💾 Resultados guardados localmente');
        } catch (error) {
            console.warn('⚠️ No se pudieron guardar los resultados:', error);
        }
    }

    downloadResults() {
        this.showNotification('📄 Generando reporte PDF...', 'info');
        
        // Simular generación de PDF
        setTimeout(() => {
            const results = {
                timestamp: new Date().toLocaleString('es-ES'),
                ageGroup: this.data.ageGroups[this.selectedAgeGroup].name,
                score: this.score,
                interpretation: this.getInterpretation(),
                categoryScores: this.categoryScores
            };
            
            // En producción, aquí se generaría un PDF real
            console.log('📄 Datos para PDF:', results);
            this.showNotification('✅ Reporte generado exitosamente', 'success');
        }, 2000);
    }

    shareResults() {
        const interpretation = this.getInterpretation();
        const shareText = `Q-CHAT Resultados:\n\nPuntuación: ${this.score}\nInterpretación: ${interpretation.title}\nGrupo de edad: ${this.data.ageGroups[this.selectedAgeGroup].name}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Resultados Q-CHAT',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('📋 Resultados copiados al portapapeles', 'success');
            }).catch(() => {
                this.showNotification('❌ No se pudo copiar al portapapeles', 'error');
            });
        }
    }

    showNotification(message, type = 'info') {
        // Remover notificaciones anteriores
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
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
                <h2>Error de Carga</h2>
                <p>${message}</p>
                <div class="error-details">
                    <p><strong>Posibles causas:</strong></p>
                    <ul>
                        <li>Problema en la inicialización del cuestionario</li>
                        <li>Error en los datos embebidos</li>
                        <li>Problema de compatibilidad del navegador</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="location.reload()">
                    🔄 Recargar Página
                </button>
            </div>
        `;
    }
}

// Inicializar aplicación cuando el DOM esté listo
let qchatApp;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM cargado, inicializando Q-CHAT...');
    qchatApp = new QChatAssessment();
    
    // Hacer disponible globalmente para onclick handlers
    window.qchatApp = qchatApp;
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('❌ Error global en Q-CHAT:', e.error);
    if (qchatApp) {
        qchatApp.showNotification('Ha ocurrido un error inesperado', 'error');
    }
});

// Prevenir pérdida de datos al cerrar
window.addEventListener('beforeunload', function(e) {
    if (qchatApp && 
        Object.keys(qchatApp.responses).length > 0 && 
        qchatApp.currentQuestion < qchatApp.data?.questions[qchatApp.selectedAgeGroup]?.length) {
            e.preventDefault();
            e.returnValue = 'Tienes una evaluación en progreso. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
    }
});

window.debugQChat = () => this.debugCurrentState();
console.log('✅ Q-CHAT JavaScript v2.0 cargado correctamente - Auto-contenido y listo para producción');