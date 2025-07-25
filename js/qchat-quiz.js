/**
 * Q-CHAT Quiz - Sistema completo de evaluación TEA
 * Basado en el Quantitative Checklist for Autism in Toddlers
 * 
 * Funcionalidades:
 * - Quiz adaptativo por edad
 * - Cálculo de puntuación y riesgo
 * - Análisis por categorías
 * - Recomendaciones personalizadas
 * - Accesibilidad completa
 * - PWA compatible
 */

console.log('🧩 Iniciando Q-CHAT Quiz v2.0...');

// === CONFIGURACIÓN GLOBAL ===
const CONFIG = {
    version: '2.0',
    debug: false,
    autoSave: true,
    animations: true,
    audioFeedback: true
};

// === DATOS DEL Q-CHAT EMBEBIDOS ===
const QCHAT_DATA = {
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
            ageRange: "2-6 años",
            minAge: 24,
            maxAge: 72,
            description: "Cuestionario adaptado para edad preescolar",
            totalQuestions: 30,
            completionTime: "8-10 minutos",
            scoringThreshold: {
                lowRisk: { min: 0, max: 3 },
                moderateRisk: { min: 4, max: 8 },
                highRisk: { min: 9, max: 30 }
            }
        },
        schoolage: {
            id: "schoolage",
            name: "Escolares",
            ageRange: "7-12 años",
            minAge: 84,
            maxAge: 144,
            description: "Cuestionario adaptado para edad escolar",
            totalQuestions: 35,
            completionTime: "10-12 minutos",
            scoringThreshold: {
                lowRisk: { min: 0, max: 4 },
                moderateRisk: { min: 5, max: 11 },
                highRisk: { min: 12, max: 35 }
            }
        }
    },
    
    questions: {
        toddlers: [
            {
                id: 1,
                text: "¿Su hijo/a le mira cuando le habla?",
                category: "social",
                subcategory: "eye_contact",
                options: [
                    { value: 0, text: "Siempre", description: "Mi hijo/a siempre me mira cuando le hablo" },
                    { value: 0, text: "Casi siempre", description: "Mi hijo/a me mira la mayoría de las veces" },
                    { value: 1, text: "A veces", description: "Mi hijo/a me mira algunas veces" },
                    { value: 1, text: "Raramente", description: "Mi hijo/a raramente me mira cuando le hablo" },
                    { value: 1, text: "Nunca", description: "Mi hijo/a nunca me mira cuando le hablo" }
                ]
            },
            {
                id: 2,
                text: "¿Qué tan fácil es para usted hacer contacto visual con su hijo/a?",
                category: "social",
                subcategory: "eye_contact",
                options: [
                    { value: 0, text: "Muy fácil", description: "Es muy fácil establecer contacto visual" },
                    { value: 0, text: "Bastante fácil", description: "Generalmente puedo establecer contacto visual sin dificultad" },
                    { value: 1, text: "Bastante difícil", description: "Me cuesta trabajo que me mire a los ojos" },
                    { value: 1, text: "Muy difícil", description: "Es muy difícil conseguir que me mire" },
                    { value: 1, text: "Imposible", description: "No puedo conseguir que me mire a los ojos" }
                ]
            },
            {
                id: 3,
                text: "¿Su hijo/a señala para pedir algo (por ejemplo, un juguete que está fuera de su alcance)?",
                category: "communication",
                subcategory: "pointing",
                options: [
                    { value: 0, text: "Muchas veces al día", description: "Señala frecuentemente para pedir cosas" },
                    { value: 0, text: "Algunas veces al día", description: "Señala regularmente cuando necesita algo" },
                    { value: 0, text: "Algunas veces por semana", description: "Ocasionalmente señala para pedir" },
                    { value: 1, text: "Menos de una vez por semana", description: "Raramente señala para pedir" },
                    { value: 1, text: "Nunca", description: "No señala para pedir cosas" }
                ]
            },
            {
                id: 4,
                text: "¿Su hijo/a señala para compartir interés con usted (por ejemplo, señalar un avión interesante en el cielo)?",
                category: "communication",
                subcategory: "joint_attention",
                options: [
                    { value: 0, text: "Muchas veces al día", description: "Frecuentemente señala para compartir interés" },
                    { value: 0, text: "Algunas veces al día", description: "Regularmente comparte su interés señalando" },
                    { value: 0, text: "Algunas veces por semana", description: "Ocasionalmente señala cosas interesantes" },
                    { value: 1, text: "Menos de una vez por semana", description: "Raramente señala para compartir" },
                    { value: 1, text: "Nunca", description: "No señala para compartir interés" }
                ]
            },
            {
                id: 5,
                text: "¿Su hijo/a pretende (por ejemplo, hacer té con una tetera y tazas de juguete, o pretender alimentar a una muñeca)?",
                category: "play",
                subcategory: "pretend_play",
                options: [
                    { value: 0, text: "Muchas veces al día", description: "Juega imaginativamente con frecuencia" },
                    { value: 0, text: "Algunas veces al día", description: "Regularmente participa en juego simbólico" },
                    { value: 0, text: "Algunas veces por semana", description: "Ocasionalmente juega de manera imaginativa" },
                    { value: 1, text: "Menos de una vez por semana", description: "Raramente participa en juego simbólico" },
                    { value: 1, text: "Nunca", description: "No muestra juego imaginativo" }
                ]
            },
            {
                id: 6,
                text: "¿Su hijo/a muestra interés en otros niños?",
                category: "social",
                subcategory: "peer_interest",
                options: [
                    { value: 0, text: "Muy interesado", description: "Muestra mucho interés en otros niños" },
                    { value: 0, text: "Bastante interesado", description: "Generalmente se interesa por otros niños" },
                    { value: 1, text: "Ligeramente interesado", description: "Muestra poco interés en otros niños" },
                    { value: 1, text: "No muestra interés", description: "No parece interesado en otros niños" }
                ]
            },
            {
                id: 7,
                text: "¿Su hijo/a responde a su nombre cuando lo llama?",
                category: "communication",
                subcategory: "response_to_name",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre responde cuando lo llamo por su nombre" },
                    { value: 0, text: "Casi siempre", description: "Generalmente responde a su nombre" },
                    { value: 1, text: "A veces", description: "Algunas veces responde a su nombre" },
                    { value: 1, text: "Raramente", description: "Raramente responde cuando lo llamo" },
                    { value: 1, text: "Nunca", description: "No responde a su nombre" }
                ]
            },
            {
                id: 8,
                text: "Si usted o alguien más de la familia se ve claramente angustiado, ¿su hijo/a muestra signos de querer consolarlo (acariciando o abrazando)?",
                category: "social",
                subcategory: "empathy",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre trata de consolar cuando alguien está triste" },
                    { value: 0, text: "Casi siempre", description: "Generalmente muestra preocupación y trata de ayudar" },
                    { value: 1, text: "A veces", description: "Ocasionalmente muestra empatía" },
                    { value: 1, text: "Raramente", description: "Raramente responde al malestar de otros" },
                    { value: 1, text: "Nunca", description: "No muestra signos de empatía" }
                ]
            },
            {
                id: 9,
                text: "¿Cómo describiría las primeras palabras de su hijo/a?",
                category: "communication",
                subcategory: "first_words",
                options: [
                    { value: 0, text: "Muy típicas", description: "Sus primeras palabras fueron completamente normales" },
                    { value: 0, text: "Bastante típicas", description: "Sus primeras palabras fueron mayormente normales" },
                    { value: 1, text: "Ligeramente inusuales", description: "Sus primeras palabras fueron algo diferentes" },
                    { value: 1, text: "Muy inusuales", description: "Sus primeras palabras fueron bastante inusuales" },
                    { value: 1, text: "Mi hijo/a no habla", description: "Aún no dice palabras reconocibles" }
                ]
            },
            {
                id: 10,
                text: "¿Su hijo/a hace gestos simples (por ejemplo, agitar la mano para decir adiós)?",
                category: "communication",
                subcategory: "gestures",
                options: [
                    { value: 0, text: "Muchas veces al día", description: "Hace gestos frecuentemente" },
                    { value: 0, text: "Algunas veces al día", description: "Regularmente usa gestos simples" },
                    { value: 0, text: "Algunas veces por semana", description: "Ocasionalmente hace gestos" },
                    { value: 1, text: "Menos de una vez por semana", description: "Raramente hace gestos" },
                    { value: 1, text: "Nunca", description: "No hace gestos simples" }
                ]
            },
            {
                id: 11,
                text: "¿Su hijo/a mira hacia donde usted está señalando?",
                category: "communication",
                subcategory: "following_pointing",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre sigue mi señalamiento con la mirada" },
                    { value: 0, text: "Casi siempre", description: "Generalmente mira hacia donde señalo" },
                    { value: 1, text: "A veces", description: "Algunas veces sigue mi señalamiento" },
                    { value: 1, text: "Raramente", description: "Raramente mira hacia donde señalo" },
                    { value: 1, text: "Nunca", description: "No sigue mi señalamiento con la mirada" }
                ]
            },
            {
                id: 12,
                text: "¿Su hijo/a puede caminar?",
                category: "motor",
                subcategory: "walking",
                options: [
                    { value: 0, text: "Sí", description: "Mi hijo/a ya camina" },
                    { value: 0, text: "No", description: "Mi hijo/a aún no camina" }
                ]
            },
            {
                id: 13,
                text: "Cuando usted está mirando algo, ¿su hijo/a mira para ver lo que usted está mirando?",
                category: "communication",
                subcategory: "joint_attention",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre sigue mi mirada" },
                    { value: 0, text: "Casi siempre", description: "Generalmente mira hacia donde estoy mirando" },
                    { value: 1, text: "A veces", description: "Algunas veces sigue mi mirada" },
                    { value: 1, text: "Raramente", description: "Raramente mira hacia donde estoy mirando" },
                    { value: 1, text: "Nunca", description: "No sigue mi mirada" }
                ]
            },
            {
                id: 14,
                text: "¿Su hijo/a trata de llamar su atención hacia su propia actividad?",
                category: "social",
                subcategory: "attention_seeking",
                options: [
                    { value: 0, text: "Muchas veces al día", description: "Frecuentemente trata de llamar mi atención" },
                    { value: 0, text: "Algunas veces al día", description: "Regularmente busca mi atención" },
                    { value: 0, text: "Algunas veces por semana", description: "Ocasionalmente busca mi atención" },
                    { value: 1, text: "Menos de una vez por semana", description: "Raramente trata de llamar mi atención" },
                    { value: 1, text: "Nunca", description: "No trata de llamar mi atención hacia sus actividades" }
                ]
            },
            {
                id: 15,
                text: "¿Su hijo/a entendería si usted le dijera 'mira' o 'mira eso'?",
                category: "communication",
                subcategory: "understanding_directions",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre entiende cuando le digo que mire algo" },
                    { value: 0, text: "Casi siempre", description: "Generalmente entiende estas instrucciones" },
                    { value: 1, text: "A veces", description: "Algunas veces entiende 'mira'" },
                    { value: 1, text: "Raramente", description: "Raramente entiende estas instrucciones" },
                    { value: 1, text: "Nunca", description: "No entiende cuando le digo 'mira'" }
                ]
            },
            {
                id: 16,
                text: "¿Su hijo/a camina de puntitas?",
                category: "motor",
                subcategory: "toe_walking",
                options: [
                    { value: 0, text: "Nunca", description: "No camina en puntitas" },
                    { value: 0, text: "Ocasionalmente", description: "Raramente camina en puntitas" },
                    { value: 1, text: "A menudo", description: "Frecuentemente camina en puntitas" },
                    { value: 1, text: "Siempre", description: "Siempre o casi siempre camina en puntitas" }
                ]
            },
            {
                id: 17,
                text: "¿Qué tan fácil es para su hijo/a adaptarse cuando su rutina cambia o cuando las cosas están fuera de lugar?",
                category: "behavioral",
                subcategory: "routine_changes",
                options: [
                    { value: 0, text: "Muy fácil", description: "Se adapta muy fácilmente a los cambios" },
                    { value: 0, text: "Bastante fácil", description: "Generalmente se adapta bien a los cambios" },
                    { value: 1, text: "Bastante difícil", description: "Le cuesta adaptarse a los cambios" },
                    { value: 1, text: "Muy difícil", description: "Le resulta muy difícil adaptarse a cambios" },
                    { value: 1, text: "Imposible", description: "No puede manejar cambios en la rutina" }
                ]
            },
            {
                id: 18,
                text: "Si hay ruido fuerte, ¿su hijo/a se cubre los oídos?",
                category: "sensory",
                subcategory: "sound_sensitivity",
                options: [
                    { value: 0, text: "Nunca", description: "No se cubre los oídos con ruidos fuertes" },
                    { value: 0, text: "Ocasionalmente", description: "Raramente se cubre los oídos" },
                    { value: 1, text: "A menudo", description: "Frecuentemente se cubre los oídos con ruidos" },
                    { value: 1, text: "Siempre", description: "Siempre se cubre los oídos ante ruidos fuertes" }
                ]
            },
            {
                id: 19,
                text: "¿Su hijo/a juega con peekaboo/cucú?",
                category: "social",
                subcategory: "social_games",
                options: [
                    { value: 0, text: "Muy interesado", description: "Le encanta jugar al cucú" },
                    { value: 0, text: "Bastante interesado", description: "Disfruta del juego del cucú" },
                    { value: 1, text: "Ligeramente interesado", description: "Muestra poco interés en el cucú" },
                    { value: 1, text: "No muestra interés", description: "No le interesa jugar al cucú" }
                ]
            },
            {
                id: 20,
                text: "¿Su hijo/a imita?",
                category: "social",
                subcategory: "imitation",
                options: [
                    { value: 0, text: "Muchas veces al día", description: "Imita frecuentemente durante el día" },
                    { value: 0, text: "Algunas veces al día", description: "Regularmente imita acciones o sonidos" },
                    { value: 0, text: "Algunas veces por semana", description: "Ocasionalmente imita" },
                    { value: 1, text: "Menos de una vez por semana", description: "Raramente imita" },
                    { value: 1, text: "Nunca", description: "No imita acciones o sonidos" }
                ]
            },
            {
                id: 21,
                text: "¿Su hijo/a examina su cara para información sobre cómo reaccionar en una situación desconocida?",
                category: "social",
                subcategory: "social_referencing",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre me mira para saber cómo reaccionar" },
                    { value: 0, text: "Casi siempre", description: "Generalmente busca mi reacción en situaciones nuevas" },
                    { value: 1, text: "A veces", description: "Algunas veces me mira para orientarse" },
                    { value: 1, text: "Raramente", description: "Raramente busca mi orientación" },
                    { value: 1, text: "Nunca", description: "No me mira para saber cómo reaccionar" }
                ]
            },
            {
                id: 22,
                text: "Si usted o alguien más se lastima ligeramente, ¿su hijo/a muestra preocupación o tristeza?",
                category: "social",
                subcategory: "empathy",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre muestra preocupación cuando alguien se lastima" },
                    { value: 0, text: "Casi siempre", description: "Generalmente se preocupa por otros" },
                    { value: 1, text: "A veces", description: "Ocasionalmente muestra preocupación" },
                    { value: 1, text: "Raramente", description: "Raramente muestra preocupación por otros" },
                    { value: 1, text: "Nunca", description: "No muestra preocupación cuando otros se lastiman" }
                ]
            },
            {
                id: 23,
                text: "¿Su hijo/a repite acciones una y otra vez?",
                category: "behavioral",
                subcategory: "repetitive_behaviors",
                options: [
                    { value: 0, text: "Nunca", description: "No repite acciones de manera obsesiva" },
                    { value: 0, text: "Ocasionalmente", description: "Raramente repite acciones" },
                    { value: 1, text: "A menudo", description: "Frecuentemente repite las mismas acciones" },
                    { value: 1, text: "Siempre", description: "Constantemente repite acciones una y otra vez" }
                ]
            },
            {
                id: 24,
                text: "¿Su hijo/a tiene una mirada inusual?",
                category: "social",
                subcategory: "unusual_gaze",
                options: [
                    { value: 0, text: "Nunca", description: "Su mirada es completamente normal" },
                    { value: 0, text: "Ocasionalmente", description: "Raramente tiene una mirada inusual" },
                    { value: 1, text: "A menudo", description: "Frecuentemente tiene una mirada extraña" },
                    { value: 1, text: "Siempre", description: "Su mirada es constantemente inusual" }
                ]
            },
            {
                id: 25,
                text: "¿Su hijo/a prefiere estar solo?",
                category: "social",
                subcategory: "social_isolation",
                options: [
                    { value: 0, text: "Nunca", description: "No prefiere estar solo, busca compañía" },
                    { value: 0, text: "Ocasionalmente", description: "Raramente prefiere la soledad" },
                    { value: 1, text: "A menudo", description: "Frecuentemente prefiere estar solo" },
                    { value: 1, text: "Siempre", description: "Siempre prefiere la soledad a la compañía" }
                ]
            }
        ],
        
        children: [
            {
                id: 1,
                text: "¿Su hijo/a hace contacto visual cuando le habla?",
                category: "social",
                subcategory: "eye_contact",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre me mira cuando hablamos" },
                    { value: 0, text: "Frecuentemente", description: "La mayoría de las veces mantiene contacto visual" },
                    { value: 1, text: "A veces", description: "Ocasionalmente me mira cuando hablamos" },
                    { value: 1, text: "Raramente", description: "Casi nunca hace contacto visual" },
                    { value: 1, text: "Nunca", description: "No hace contacto visual cuando hablamos" }
                ]
            },
            {
                id: 2,
                text: "¿Su hijo/a comparte sus intereses con usted mostrándole cosas?",
                category: "communication",
                subcategory: "sharing_interest",
                options: [
                    { value: 0, text: "Muy frecuentemente", description: "Constantemente me muestra cosas que le interesan" },
                    { value: 0, text: "Frecuentemente", description: "Regularmente comparte sus intereses conmigo" },
                    { value: 1, text: "Ocasionalmente", description: "A veces me muestra cosas" },
                    { value: 1, text: "Raramente", description: "Casi nunca comparte sus intereses" },
                    { value: 1, text: "Nunca", description: "No me muestra cosas que le interesan" }
                ]
            },
            {
                id: 3,
                text: "¿Su hijo/a participa en juegos imaginativos?",
                category: "play",
                subcategory: "imaginative_play",
                options: [
                    { value: 0, text: "Muy creativamente", description: "Tiene juegos imaginativos muy creativos" },
                    { value: 0, text: "Creativamente", description: "Participa en juego simbólico regularmente" },
                    { value: 1, text: "Limitadamente", description: "Su juego imaginativo es limitado" },
                    { value: 1, text: "Muy poco", description: "Casi no participa en juego imaginativo" },
                    { value: 1, text: "Nunca", description: "No muestra juego imaginativo" }
                ]
            },
            {
                id: 4,
                text: "¿Cómo responde su hijo/a cuando otros niños se acercan durante el juego?",
                category: "social",
                subcategory: "peer_interaction",
                options: [
                    { value: 0, text: "Se une alegremente", description: "Se integra fácilmente al juego con otros" },
                    { value: 0, text: "Responde positivamente", description: "Generalmente acepta la interacción" },
                    { value: 1, text: "Responde con cautela", description: "Es cauteloso pero acepta la interacción" },
                    { value: 1, text: "Se retira", description: "Tiende a alejarse de otros niños" },
                    { value: 1, text: "Los ignora completamente", description: "No responde a las aproximaciones de otros niños" }
                ]
            },
            {
                id: 5,
                text: "¿Su hijo/a entiende emociones simples en otros (feliz, triste, enojado)?",
                category: "social",
                subcategory: "emotion_recognition",
                options: [
                    { value: 0, text: "Muy bien", description: "Entiende perfectamente las emociones básicas" },
                    { value: 0, text: "Bien", description: "Generalmente reconoce emociones simples" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta reconocer emociones" },
                    { value: 1, text: "Muy poco", description: "Raramente reconoce emociones en otros" },
                    { value: 1, text: "No las entiende", description: "No muestra comprensión de emociones" }
                ]
            },
            {
                id: 6,
                text: "¿Su hijo/a utiliza gestos complejos para comunicarse (además de señalar)?",
                category: "communication",
                subcategory: "complex_gestures",
                options: [
                    { value: 0, text: "Frecuentemente", description: "Usa variedad de gestos expresivos" },
                    { value: 0, text: "Regularmente", description: "Ocasionalmente usa gestos complejos" },
                    { value: 1, text: "Ocasionalmente", description: "Pocos gestos más allá de señalar" },
                    { value: 1, text: "Raramente", description: "Muy limitado en gestos" },
                    { value: 1, text: "Nunca", description: "No usa gestos complejos" }
                ]
            },
            {
                id: 7,
                text: "¿Su hijo/a inicia juegos sociales simples (como correr y que lo persigan)?",
                category: "social",
                subcategory: "social_games",
                options: [
                    { value: 0, text: "Frecuentemente", description: "A menudo inicia juegos con otros" },
                    { value: 0, text: "Ocasionalmente", description: "A veces inicia juegos sociales" },
                    { value: 1, text: "Raramente", description: "Pocas veces inicia juegos" },
                    { value: 1, text: "Muy raramente", description: "Casi nunca inicia juegos sociales" },
                    { value: 1, text: "Nunca", description: "No inicia juegos sociales" }
                ]
            },
            {
                id: 8,
                text: "¿Su hijo/a imita acciones en juegos (como aplaudir en canciones)?",
                category: "social",
                subcategory: "imitation",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre imita en actividades grupales" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente participa imitando" },
                    { value: 1, text: "A veces", description: "Ocasionalmente imita acciones" },
                    { value: 1, text: "Raramente", description: "Pocas veces imita" },
                    { value: 1, text: "Nunca", description: "No imita acciones en juegos" }
                ]
            },
            {
                id: 9,
                text: "¿Su hijo/a responde cuando usted le dice su nombre desde otra habitación?",
                category: "communication",
                subcategory: "response_to_name",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre responde cuando lo llamo" },
                    { value: 0, text: "Casi siempre", description: "Generalmente responde a su nombre" },
                    { value: 1, text: "A veces", description: "Algunas veces responde" },
                    { value: 1, text: "Raramente", description: "Pocas veces responde cuando lo llamo" },
                    { value: 1, text: "Nunca", description: "No responde cuando lo llamo" }
                ]
            },
            {
                id: 10,
                text: "¿Su hijo/a señala objetos para compartir interés (no solo para pedir)?",
                category: "communication",
                subcategory: "joint_attention",
                options: [
                    { value: 0, text: "Frecuentemente", description: "A menudo señala para mostrar cosas interesantes" },
                    { value: 0, text: "Ocasionalmente", description: "A veces señala para compartir" },
                    { value: 1, text: "Raramente", description: "Pocas veces señala para compartir" },
                    { value: 1, text: "Muy raramente", description: "Casi nunca señala para compartir" },
                    { value: 1, text: "Nunca", description: "Solo señala para pedir, no para compartir" }
                ]
            },
            {
                id: 11,
                text: "¿Su hijo/a puede seguir instrucciones simples de dos pasos?",
                category: "communication",
                subcategory: "following_instructions",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre sigue instrucciones de dos pasos" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente puede seguir instrucciones complejas" },
                    { value: 1, text: "A veces", description: "Ocasionalmente sigue instrucciones de dos pasos" },
                    { value: 1, text: "Raramente", description: "Le cuesta seguir instrucciones complejas" },
                    { value: 1, text: "Nunca", description: "No puede seguir instrucciones de dos pasos" }
                ]
            },
            {
                id: 12,
                text: "¿Su hijo/a muestra objetos a otros sin ser solicitado?",
                category: "social",
                subcategory: "sharing_interest",
                options: [
                    { value: 0, text: "Frecuentemente", description: "A menudo comparte objetos espontáneamente" },
                    { value: 0, text: "Ocasionalmente", description: "A veces muestra objetos a otros" },
                    { value: 1, text: "Raramente", description: "Pocas veces comparte objetos" },
                    { value: 1, text: "Muy raramente", description: "Casi nunca muestra objetos" },
                    { value: 1, text: "Nunca", description: "No comparte objetos espontáneamente" }
                ]
            },
            {
                id: 13,
                text: "¿Su hijo/a demuestra preocupación cuando otros están heridos o molestos?",
                category: "social",
                subcategory: "empathy",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre muestra empatía hacia otros" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente se preocupa por otros" },
                    { value: 1, text: "A veces", description: "Ocasionalmente muestra preocupación" },
                    { value: 1, text: "Raramente", description: "Pocas veces muestra empatía" },
                    { value: 1, text: "Nunca", description: "No muestra preocupación por otros" }
                ]
            },
            {
                id: 14,
                text: "¿Su hijo/a juega apropiadamente con juguetes (los usa para su propósito previsto)?",
                category: "play",
                subcategory: "functional_play",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre usa juguetes apropiadamente" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente juega funcionalmente" },
                    { value: 1, text: "A veces", description: "Ocasionalmente usa juguetes apropiadamente" },
                    { value: 1, text: "Raramente", description: "Pocas veces juega funcionalmente" },
                    { value: 1, text: "Nunca", description: "No usa juguetes para su propósito" }
                ]
            },
            {
                id: 15,
                text: "¿Su hijo/a se adapta a cambios en rutinas con apoyo mínimo?",
                category: "behavioral",
                subcategory: "flexibility",
                options: [
                    { value: 0, text: "Fácilmente", description: "Se adapta bien a cambios" },
                    { value: 0, text: "Con algo de apoyo", description: "Se adapta con ayuda mínima" },
                    { value: 1, text: "Con mucho apoyo", description: "Necesita mucha ayuda para adaptarse" },
                    { value: 1, text: "Con gran dificultad", description: "Le resulta muy difícil adaptarse" },
                    { value: 1, text: "No se adapta", description: "No puede manejar cambios en rutinas" }
                ]
            },
            {
                id: 16,
                text: "¿Su hijo/a busca confort cuando está herido o molesto?",
                category: "social",
                subcategory: "seeking_comfort",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre busca consuelo cuando lo necesita" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente busca apoyo" },
                    { value: 1, text: "A veces", description: "Ocasionalmente busca confort" },
                    { value: 1, text: "Raramente", description: "Pocas veces busca consuelo" },
                    { value: 1, text: "Nunca", description: "No busca confort de otros" }
                ]
            },
            {
                id: 17,
                text: "¿Su hijo/a tiene sensibilidades sensoriales marcadas (sonidos, texturas, luces)?",
                category: "sensory",
                subcategory: "sensory_sensitivity",
                options: [
                    { value: 0, text: "Nunca", description: "No muestra sensibilidades sensoriales" },
                    { value: 0, text: "Ocasionalmente", description: "Pocas sensibilidades sensoriales" },
                    { value: 1, text: "A veces", description: "Algunas sensibilidades sensoriales" },
                    { value: 1, text: "Frecuentemente", description: "Muchas sensibilidades sensoriales" },
                    { value: 1, text: "Siempre", description: "Sensibilidades sensoriales marcadas" }
                ]
            },
            {
                id: 18,
                text: "¿Su hijo/a disfruta de actividades físicas simples (balancearse, girar)?",
                category: "motor",
                subcategory: "physical_activities",
                options: [
                    { value: 0, text: "Mucho", description: "Disfruta mucho de actividades físicas" },
                    { value: 0, text: "Moderadamente", description: "Le gustan las actividades físicas" },
                    { value: 1, text: "Poco", description: "Muestra poco interés en actividades físicas" },
                    { value: 1, text: "Muy poco", description: "Muy poco interés en actividades físicas" },
                    { value: 1, text: "Nada", description: "No disfruta actividades físicas" }
                ]
            },
            {
                id: 19,
                text: "¿Su hijo/a intenta comunicarse cuando no puede hacer algo solo?",
                category: "communication",
                subcategory: "help_seeking",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre pide ayuda cuando la necesita" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente comunica cuando necesita ayuda" },
                    { value: 1, text: "A veces", description: "Ocasionalmente pide ayuda" },
                    { value: 1, text: "Raramente", description: "Pocas veces pide ayuda" },
                    { value: 1, text: "Nunca", description: "No comunica cuando necesita ayuda" }
                ]
            },
            {
                id: 20,
                text: "¿Su hijo/a mira a las personas cuando están hablando en grupo?",
                category: "social",
                subcategory: "group_attention",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre presta atención en grupos" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente mira a quien habla" },
                    { value: 1, text: "A veces", description: "Ocasionalmente presta atención al grupo" },
                    { value: 1, text: "Raramente", description: "Pocas veces mira a quien habla" },
                    { value: 1, text: "Nunca", description: "No presta atención en situaciones grupales" }
                ]
            },
            {
                id: 21,
                text: "¿Su hijo/a participa en juegos de imitación simple (como 'Simón dice')?",
                category: "social",
                subcategory: "imitation_games",
                options: [
                    { value: 0, text: "Entusiastamente", description: "Participa activamente en juegos de imitación" },
                    { value: 0, text: "Dispuestamente", description: "Le gustan los juegos de imitación" },
                    { value: 1, text: "Con reluctancia", description: "Participa pero sin entusiasmo" },
                    { value: 1, text: "Raramente", description: "Pocas veces participa en imitación" },
                    { value: 1, text: "Nunca", description: "No participa en juegos de imitación" }
                ]
            },
            {
                id: 22,
                text: "¿Su hijo/a responde a expresiones faciales de otros?",
                category: "social",
                subcategory: "facial_expressions",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre responde a expresiones faciales" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente nota expresiones faciales" },
                    { value: 1, text: "A veces", description: "Ocasionalmente responde a expresiones" },
                    { value: 1, text: "Raramente", description: "Pocas veces nota expresiones faciales" },
                    { value: 1, text: "Nunca", description: "No responde a expresiones faciales" }
                ]
            },
            {
                id: 23,
                text: "¿Su hijo/a muestra comportamientos repetitivos con objetos (girar, alinear)?",
                category: "behavioral",
                subcategory: "repetitive_behaviors",
                options: [
                    { value: 0, text: "Nunca", description: "No muestra comportamientos repetitivos" },
                    { value: 0, text: "Ocasionalmente", description: "Pocas veces muestra comportamientos repetitivos" },
                    { value: 1, text: "A veces", description: "Algunos comportamientos repetitivos" },
                    { value: 1, text: "Frecuentemente", description: "Muchos comportamientos repetitivos" },
                    { value: 1, text: "Constantemente", description: "Comportamientos repetitivos constantes" }
                ]
            },
            {
                id: 24,
                text: "¿Su hijo/a disfruta estar en brazos o ser abrazado?",
                category: "sensory",
                subcategory: "physical_affection",
                options: [
                    { value: 0, text: "Mucho", description: "Le encanta el contacto físico afectuoso" },
                    { value: 0, text: "Moderadamente", description: "Disfruta del contacto físico" },
                    { value: 1, text: "Poco", description: "Tolera pero no busca contacto físico" },
                    { value: 1, text: "Muy poco", description: "Evita la mayoría del contacto físico" },
                    { value: 1, text: "Nada", description: "Rechaza contacto físico afectuoso" }
                ]
            },
            {
                id: 25,
                text: "¿Su hijo/a intenta obtener su atención para mostrarle cosas?",
                category: "social",
                subcategory: "attention_seeking",
                options: [
                    { value: 0, text: "Frecuentemente", description: "A menudo busca mi atención para compartir" },
                    { value: 0, text: "Ocasionalmente", description: "A veces me busca para mostrar cosas" },
                    { value: 1, text: "Raramente", description: "Pocas veces busca mi atención" },
                    { value: 1, text: "Muy raramente", description: "Casi nunca busca mi atención" },
                    { value: 1, text: "Nunca", description: "No busca mi atención para compartir" }
                ]
            },
            {
                id: 26,
                text: "¿Su hijo/a usa palabras de manera apropiada para su edad?",
                category: "communication",
                subcategory: "language_use",
                options: [
                    { value: 0, text: "Completamente apropiado", description: "Usa palabras muy apropiadamente para su edad" },
                    { value: 0, text: "Mayormente apropiado", description: "Generalmente usa palabras apropiadamente" },
                    { value: 1, text: "Algo inapropiado", description: "Uso de palabras algo inmaduro" },
                    { value: 1, text: "Muy inapropiado", description: "Uso de palabras muy inmaduro" },
                    { value: 1, text: "No usa palabras", description: "No ha desarrollado lenguaje hablado" }
                ]
            },
            {
                id: 27,
                text: "¿Su hijo/a parece entender lo que otros están sintiendo?",
                category: "social",
                subcategory: "emotional_understanding",
                options: [
                    { value: 0, text: "Muy bien", description: "Entiende muy bien las emociones de otros" },
                    { value: 0, text: "Bien", description: "Generalmente entiende las emociones de otros" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta entender emociones de otros" },
                    { value: 1, text: "Muy poco", description: "Entiende muy poco las emociones" },
                    { value: 1, text: "No entiende", description: "No muestra comprensión de emociones" }
                ]
            },
            {
                id: 28,
                text: "¿Su hijo/a puede mantener atención en actividades apropiadas para su edad?",
                category: "behavioral",
                subcategory: "attention_span",
                options: [
                    { value: 0, text: "Tiempo apropiado", description: "Mantiene atención por tiempo apropiado" },
                    { value: 0, text: "Casi apropiado", description: "Atención casi apropiada para su edad" },
                    { value: 1, text: "Algo corta", description: "Atención algo corta para su edad" },
                    { value: 1, text: "Muy corta", description: "Atención muy corta para su edad" },
                    { value: 1, text: "Extremadamente corta", description: "Atención extremadamente limitada" }
                ]
            },
            {
                id: 29,
                text: "¿Su hijo/a se frustra fácilmente cuando las cosas no salen como espera?",
                category: "behavioral",
                subcategory: "frustration_tolerance",
                options: [
                    { value: 0, text: "Raramente", description: "Maneja bien la frustración" },
                    { value: 0, text: "Ocasionalmente", description: "Se frustra ocasionalmente" },
                    { value: 1, text: "Frecuentemente", description: "Se frustra frecuentemente" },
                    { value: 1, text: "Muy frecuentemente", description: "Se frustra muy fácilmente" },
                    { value: 1, text: "Constantemente", description: "Frustración constante e intensa" }
                ]
            },
            {
                id: 30,
                text: "¿Su hijo/a disfruta de rutinas y se molesta cuando cambian?",
                category: "behavioral",
                subcategory: "routine_preference",
                options: [
                    { value: 0, text: "Flexible con cambios", description: "Se adapta fácilmente a cambios en rutinas" },
                    { value: 0, text: "Algo flexible", description: "Se adapta con apoyo mínimo" },
                    { value: 1, text: "Prefiere rutinas", description: "Le gustan las rutinas pero tolera cambios" },
                    { value: 1, text: "Muy apegado a rutinas", description: "Se molesta con cambios en rutinas" },
                    { value: 1, text: "Extremadamente rígido", description: "No tolera ningún cambio en rutinas" }
                ]
            }
        ],
        
        schoolage: [
            {
                id: 1,
                text: "¿Su hijo/a inicia conversaciones con otros niños?",
                category: "social",
                subcategory: "conversation_initiation",
                options: [
                    { value: 0, text: "Frecuentemente", description: "A menudo inicia conversaciones con sus pares" },
                    { value: 0, text: "Regularmente", description: "Inicia conversaciones de vez en cuando" },
                    { value: 1, text: "Ocasionalmente", description: "Raramente inicia conversaciones" },
                    { value: 1, text: "Muy raramente", description: "Casi nunca inicia conversaciones" },
                    { value: 1, text: "Nunca", description: "No inicia conversaciones con otros niños" }
                ]
            },
            {
                id: 2,
                text: "¿Su hijo/a entiende el sarcasmo o las bromas simples?",
                category: "communication",
                subcategory: "humor_understanding",
                options: [
                    { value: 0, text: "Muy bien", description: "Entiende perfectamente el humor y sarcasmo" },
                    { value: 0, text: "Bien", description: "Generalmente entiende bromas simples" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta entender el humor" },
                    { value: 1, text: "Muy poco", description: "Raramente entiende bromas o sarcasmo" },
                    { value: 1, text: "No lo entiende", description: "No comprende el humor o sarcasmo" }
                ]
            },
            {
                id: 3,
                text: "¿Su hijo/a mantiene amistades apropiadas para su edad?",
                category: "social",
                subcategory: "friendships",
                options: [
                    { value: 0, text: "Varias amistades sólidas", description: "Tiene múltiples amistades saludables" },
                    { value: 0, text: "Algunas amistades", description: "Mantiene algunas amistades apropiadas" },
                    { value: 1, text: "Pocas amistades", description: "Tiene dificultad manteniendo amistades" },
                    { value: 1, text: "Muy pocas amistades", description: "Muy pocas relaciones de amistad" },
                    { value: 1, text: "No tiene amistades", description: "No mantiene relaciones de amistad" }
                ]
            },
            {
                id: 4,
                text: "¿Su hijo/a entiende reglas sociales no escritas (espacio personal, turnos)?",
                category: "social",
                subcategory: "social_rules",
                options: [
                    { value: 0, text: "Muy bien", description: "Entiende perfectamente las reglas sociales" },
                    { value: 0, text: "Bien", description: "Generalmente sigue reglas sociales apropiadas" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta entender reglas sociales" },
                    { value: 1, text: "Muy poco", description: "Entiende muy pocas reglas sociales" },
                    { value: 1, text: "No las entiende", description: "No comprende reglas sociales básicas" }
                ]
            },
            {
                id: 5,
                text: "¿Su hijo/a puede participar en conversaciones de ida y vuelta?",
                category: "communication",
                subcategory: "reciprocal_conversation",
                options: [
                    { value: 0, text: "Muy bien", description: "Mantiene conversaciones recíprocas fluidamente" },
                    { value: 0, text: "Bien", description: "Generalmente participa en conversaciones bidireccionales" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta mantener conversaciones recíprocas" },
                    { value: 1, text: "Muy poco", description: "Participación muy limitada en conversaciones" },
                    { value: 1, text: "No puede", description: "No puede mantener conversaciones recíprocas" }
                ]
            },
            {
                id: 6,
                text: "¿Su hijo/a muestra interés en actividades grupales organizadas?",
                category: "social",
                subcategory: "group_activities",
                options: [
                    { value: 0, text: "Mucho interés", description: "Le encantan las actividades grupales" },
                    { value: 0, text: "Interés moderado", description: "Disfruta algunas actividades grupales" },
                    { value: 1, text: "Poco interés", description: "Muestra poco interés en grupos" },
                    { value: 1, text: "Muy poco interés", description: "Evita la mayoría de actividades grupales" },
                    { value: 1, text: "No muestra interés", description: "Rechaza actividades grupales" }
                ]
            },
            {
                id: 7,
                text: "¿Su hijo/a puede cambiar de tema de conversación apropiadamente?",
                category: "communication",
                subcategory: "conversation_skills",
                options: [
                    { value: 0, text: "Muy apropiadamente", description: "Cambia de tema muy naturalmente" },
                    { value: 0, text: "Apropiadamente", description: "Generalmente cambia de tema apropiadamente" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta cambiar de tema apropiadamente" },
                    { value: 1, text: "Muy rígido", description: "Muy rígido en conversaciones" },
                    { value: 1, text: "No puede", description: "No puede cambiar de tema apropiadamente" }
                ]
            },
            {
                id: 8,
                text: "¿Su hijo/a entiende perspectivas diferentes a la suya?",
                category: "social",
                subcategory: "perspective_taking",
                options: [
                    { value: 0, text: "Muy bien", description: "Entiende muy bien diferentes perspectivas" },
                    { value: 0, text: "Bien", description: "Generalmente entiende otras perspectivas" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta entender otras perspectivas" },
                    { value: 1, text: "Muy poco", description: "Muy limitado en entender perspectivas" },
                    { value: 1, text: "No entiende", description: "No puede considerar perspectivas diferentes" }
                ]
            },
            {
                id: 9,
                text: "¿Su hijo/a adapta su comunicación según con quién habla?",
                category: "communication",
                subcategory: "communication_adaptation",
                options: [
                    { value: 0, text: "Muy bien", description: "Adapta comunicación muy apropiadamente" },
                    { value: 0, text: "Bien", description: "Generalmente adapta su comunicación" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta adaptar su comunicación" },
                    { value: 1, text: "Muy poco", description: "Muy poca adaptación comunicativa" },
                    { value: 1, text: "No adapta", description: "No adapta su comunicación al contexto" }
                ]
            },
            {
                id: 10,
                text: "¿Su hijo/a puede trabajar cooperativamente en proyectos grupales?",
                category: "social",
                subcategory: "cooperation",
                options: [
                    { value: 0, text: "Muy bien", description: "Coopera muy bien en grupos" },
                    { value: 0, text: "Bien", description: "Generalmente coopera en proyectos grupales" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta cooperar en grupos" },
                    { value: 1, text: "Muy poco", description: "Cooperación muy limitada" },
                    { value: 1, text: "No puede", description: "No puede cooperar en proyectos grupales" }
                ]
            },
            {
                id: 11,
                text: "¿Su hijo/a entiende cuando otros están bromeando vs. siendo serios?",
                category: "social",
                subcategory: "social_context",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre distingue entre broma y seriedad" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente entiende el contexto social" },
                    { value: 1, text: "A veces", description: "Ocasionalmente malinterpreta el contexto" },
                    { value: 1, text: "Raramente", description: "Frecuentemente malinterpreta situaciones" },
                    { value: 1, text: "Nunca", description: "No puede distinguir contexto social" }
                ]
            },
            {
                id: 12,
                text: "¿Su hijo/a muestra flexibilidad cuando sus planes cambian?",
                category: "behavioral",
                subcategory: "flexibility",
                options: [
                    { value: 0, text: "Muy flexible", description: "Se adapta muy fácilmente a cambios de planes" },
                    { value: 0, text: "Flexible", description: "Generalmente se adapta a cambios" },
                    { value: 1, text: "Algo rígido", description: "Le cuesta adaptarse a cambios de planes" },
                    { value: 1, text: "Muy rígido", description: "Muy difícil para él adaptarse a cambios" },
                    { value: 1, text: "Extremadamente rígido", description: "No tolera cambios en planes" }
                ]
            },
            {
                id: 13,
                text: "¿Su hijo/a puede resolver conflictos sociales apropiadamente?",
                category: "social",
                subcategory: "conflict_resolution",
                options: [
                    { value: 0, text: "Muy bien", description: "Resuelve conflictos muy apropiadamente" },
                    { value: 0, text: "Bien", description: "Generalmente maneja conflictos apropiadamente" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta resolver conflictos sociales" },
                    { value: 1, text: "Muy poco", description: "Muy limitado en resolución de conflictos" },
                    { value: 1, text: "No puede", description: "No puede resolver conflictos sociales" }
                ]
            },
            {
                id: 14,
                text: "¿Su hijo/a tiene intereses obsesivos o muy intensos?",
                category: "behavioral",
                subcategory: "intense_interests",
                options: [
                    { value: 0, text: "No", description: "No muestra intereses obsesivos" },
                    { value: 0, text: "Intereses normales", description: "Tiene intereses apropiados para su edad" },
                    { value: 1, text: "Algo intensos", description: "Algunos intereses algo intensos" },
                    { value: 1, text: "Muy intensos", description: "Intereses muy intensos o limitados" },
                    { value: 1, text: "Obsesivos", description: "Intereses obsesivos que interfieren con otras actividades" }
                ]
            },
            {
                id: 15,
                text: "¿Su hijo/a puede mantener atención en tareas académicas apropiadas para su edad?",
                category: "behavioral",
                subcategory: "academic_attention",
                options: [
                    { value: 0, text: "Muy bien", description: "Mantiene atención académica muy apropiadamente" },
                    { value: 0, text: "Bien", description: "Generalmente mantiene buena atención académica" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta mantener atención en tareas académicas" },
                    { value: 1, text: "Muy poco", description: "Atención académica muy limitada" },
                    { value: 1, text: "No puede", description: "No puede mantener atención en tareas académicas" }
                ]
            },
            {
                id: 16,
                text: "¿Su hijo/a busca apoyo emocional cuando se siente abrumado?",
                category: "social",
                subcategory: "emotional_support_seeking",
                options: [
                    { value: 0, text: "Siempre", description: "Siempre busca apoyo cuando lo necesita" },
                    { value: 0, text: "Frecuentemente", description: "Generalmente busca apoyo emocional apropiado" },
                    { value: 1, text: "A veces", description: "Ocasionalmente busca apoyo emocional" },
                    { value: 1, text: "Raramente", description: "Raramente busca apoyo cuando está abrumado" },
                    { value: 1, text: "Nunca", description: "No busca apoyo emocional de otros" }
                ]
            },
            {
                id: 17,
                text: "¿Su hijo/a puede seguir instrucciones de múltiples pasos en entornos ruidosos?",
                category: "communication",
                subcategory: "complex_instructions",
                options: [
                    { value: 0, text: "Muy bien", description: "Sigue instrucciones complejas incluso con distracciones" },
                    { value: 0, text: "Bien", description: "Generalmente sigue instrucciones de múltiples pasos" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta seguir instrucciones complejas" },
                    { value: 1, text: "Muy poco", description: "Muy limitado siguiendo instrucciones complejas" },
                    { value: 1, text: "No puede", description: "No puede seguir instrucciones de múltiples pasos" }
                ]
            },
            {
                id: 18,
                text: "¿Su hijo/a demuestra comprensión de emociones complejas (orgullo, vergüenza, celos)?",
                category: "social",
                subcategory: "complex_emotions",
                options: [
                    { value: 0, text: "Muy bien", description: "Entiende muy bien emociones complejas" },
                    { value: 0, text: "Bien", description: "Generalmente entiende emociones complejas" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta entender emociones complejas" },
                    { value: 1, text: "Muy poco", description: "Comprensión muy limitada de emociones complejas" },
                    { value: 1, text: "No entiende", description: "No comprende emociones más allá de básicas" }
                ]
            },
            {
                id: 19,
                text: "¿Su hijo/a puede participar en juegos con reglas complejas?",
                category: "play",
                subcategory: "rule_based_games",
                options: [
                    { value: 0, text: "Muy bien", description: "Participa muy bien en juegos con reglas complejas" },
                    { value: 0, text: "Bien", description: "Generalmente sigue reglas de juegos complejos" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta seguir reglas complejas de juegos" },
                    { value: 1, text: "Muy poco", description: "Muy limitado en juegos con reglas complejas" },
                    { value: 1, text: "No puede", description: "No puede participar en juegos con reglas complejas" }
                ]
            },
            {
                id: 20,
                text: "¿Su hijo/a tiene movimientos repetitivos o estereotipados?",
                category: "motor",
                subcategory: "repetitive_movements",
                options: [
                    { value: 0, text: "Nunca", description: "No muestra movimientos repetitivos" },
                    { value: 0, text: "Ocasionalmente", description: "Muy ocasionalmente movimientos repetitivos" },
                    { value: 1, text: "A veces", description: "Algunos movimientos repetitivos" },
                    { value: 1, text: "Frecuentemente", description: "Movimientos repetitivos frecuentes" },
                    { value: 1, text: "Constantemente", description: "Movimientos repetitivos constantes" }
                ]
            },
            {
                id: 21,
                text: "¿Su hijo/a puede interpretar lenguaje no verbal (gestos, expresiones faciales)?",
                category: "communication",
                subcategory: "nonverbal_communication",
                options: [
                    { value: 0, text: "Muy bien", description: "Interpreta muy bien el lenguaje no verbal" },
                    { value: 0, text: "Bien", description: "Generalmente entiende lenguaje no verbal" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta interpretar lenguaje no verbal" },
                    { value: 1, text: "Muy poco", description: "Interpretación muy limitada de lenguaje no verbal" },
                    { value: 1, text: "No puede", description: "No interpreta lenguaje no verbal" }
                ]
            },
            {
                id: 22,
                text: "¿Su hijo/a se involucra en juego imaginativo complejo con otros?",
                category: "play",
                subcategory: "complex_imaginative_play",
                options: [
                    { value: 0, text: "Frecuentemente", description: "A menudo participa en juego imaginativo complejo" },
                    { value: 0, text: "Ocasionalmente", description: "A veces se involucra en juego imaginativo con otros" },
                    { value: 1, text: "Raramente", description: "Raramente participa en juego imaginativo complejo" },
                    { value: 1, text: "Muy raramente", description: "Casi nunca se involucra en juego imaginativo" },
                    { value: 1, text: "Nunca", description: "No participa en juego imaginativo con otros" }
                ]
            },
            {
                id: 23,
                text: "¿Su hijo/a puede manejar situaciones sociales impredecibles?",
                category: "social",
                subcategory: "social_flexibility",
                options: [
                    { value: 0, text: "Muy bien", description: "Maneja muy bien situaciones sociales impredecibles" },
                    { value: 0, text: "Bien", description: "Generalmente se adapta a situaciones sociales nuevas" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta manejar situaciones sociales impredecibles" },
                    { value: 1, text: "Muy poco", description: "Muy limitado en situaciones sociales nuevas" },
                    { value: 1, text: "No puede", description: "No puede manejar situaciones sociales impredecibles" }
                ]
            },
            {
                id: 24,
                text: "¿Su hijo/a muestra comportamientos autoestimulatorios (balancearse, aletear manos)?",
                category: "motor",
                subcategory: "self_stimulatory_behaviors",
                options: [
                    { value: 0, text: "Nunca", description: "No muestra comportamientos autoestimulatorios" },
                    { value: 0, text: "Ocasionalmente", description: "Muy ocasionalmente comportamientos autoestimulatorios" },
                    { value: 1, text: "A veces", description: "Algunos comportamientos autoestimulatorios" },
                    { value: 1, text: "Frecuentemente", description: "Comportamientos autoestimulatorios frecuentes" },
                    { value: 1, text: "Constantemente", description: "Comportamientos autoestimulatorios constantes" }
                ]
            },
            {
                id: 25,
                text: "¿Su hijo/a puede generalizar habilidades aprendidas a nuevas situaciones?",
                category: "behavioral",
                subcategory: "skill_generalization",
                options: [
                    { value: 0, text: "Muy bien", description: "Generaliza habilidades muy fácilmente" },
                    { value: 0, text: "Bien", description: "Generalmente puede generalizar habilidades" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta generalizar habilidades" },
                    { value: 1, text: "Muy poco", description: "Generalización muy limitada de habilidades" },
                    { value: 1, text: "No puede", description: "No puede generalizar habilidades a nuevas situaciones" }
                ]
            },
            {
                id: 26,
                text: "¿Su hijo/a tiene sensibilidades sensoriales que interfieren con actividades diarias?",
                category: "sensory",
                subcategory: "sensory_interference",
                options: [
                    { value: 0, text: "Nunca", description: "No tiene sensibilidades que interfieran" },
                    { value: 0, text: "Ocasionalmente", description: "Pocas sensibilidades que ocasionalmente interfieren" },
                    { value: 1, text: "A veces", description: "Algunas sensibilidades que interfieren moderadamente" },
                    { value: 1, text: "Frecuentemente", description: "Sensibilidades que frecuentemente interfieren" },
                    { value: 1, text: "Constantemente", description: "Sensibilidades que constantemente interfieren con actividades" }
                ]
            },
            {
                id: 27,
                text: "¿Su hijo/a puede comunicar sus necesidades de manera efectiva?",
                category: "communication",
                subcategory: "needs_communication",
                options: [
                    { value: 0, text: "Muy efectivamente", description: "Comunica necesidades muy claramente" },
                    { value: 0, text: "Efectivamente", description: "Generalmente comunica necesidades bien" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta comunicar necesidades efectivamente" },
                    { value: 1, text: "Muy poco", description: "Comunicación de necesidades muy limitada" },
                    { value: 1, text: "No puede", description: "No puede comunicar necesidades efectivamente" }
                ]
            },
            {
                id: 28,
                text: "¿Su hijo/a demuestra creatividad apropiada para su edad?",
                category: "play",
                subcategory: "creativity",
                options: [
                    { value: 0, text: "Muy creativo", description: "Muestra creatividad muy apropiada para su edad" },
                    { value: 0, text: "Creativo", description: "Demuestra creatividad apropiada" },
                    { value: 1, text: "Algo limitado", description: "Creatividad algo limitada para su edad" },
                    { value: 1, text: "Muy limitado", description: "Creatividad muy limitada" },
                    { value: 1, text: "No creativo", description: "No demuestra creatividad apropiada" }
                ]
            },
            {
                id: 29,
                text: "¿Su hijo/a puede manejar críticas constructivas apropiadamente?",
                category: "social",
                subcategory: "criticism_handling",
                options: [
                    { value: 0, text: "Muy bien", description: "Maneja críticas constructivas muy apropiadamente" },
                    { value: 0, text: "Bien", description: "Generalmente acepta críticas constructivas" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta manejar críticas constructivas" },
                    { value: 1, text: "Muy poco", description: "Muy sensible a cualquier crítica" },
                    { value: 1, text: "No puede", description: "No puede manejar ninguna crítica" }
                ]
            },
            {
                id: 30,
                text: "¿Su hijo/a muestra iniciativa en actividades sociales?",
                category: "social",
                subcategory: "social_initiative",
                options: [
                    { value: 0, text: "Mucha iniciativa", description: "Toma mucha iniciativa en situaciones sociales" },
                    { value: 0, text: "Iniciativa apropiada", description: "Muestra iniciativa social apropiada" },
                    { value: 1, text: "Poca iniciativa", description: "Poca iniciativa en situaciones sociales" },
                    { value: 1, text: "Muy poca iniciativa", description: "Muy poca iniciativa social" },
                    { value: 1, text: "No muestra iniciativa", description: "No toma iniciativa en actividades sociales" }
                ]
            },
            {
                id: 31,
                text: "¿Su hijo/a puede mantener conversaciones sobre temas que no son de su interés particular?",
                category: "communication",
                subcategory: "conversation_flexibility",
                options: [
                    { value: 0, text: "Muy bien", description: "Puede conversar sobre cualquier tema apropiadamente" },
                    { value: 0, text: "Bien", description: "Generalmente puede conversar sobre diversos temas" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta conversar sobre temas que no le interesan" },
                    { value: 1, text: "Muy poco", description: "Solo conversa sobre sus intereses específicos" },
                    { value: 1, text: "No puede", description: "No puede mantener conversaciones fuera de sus intereses" }
                ]
            },
            {
                id: 32,
                text: "¿Su hijo/a demuestra comprensión de conceptos abstractos apropiados para su edad?",
                category: "behavioral",
                subcategory: "abstract_thinking",
                options: [
                    { value: 0, text: "Muy bien", description: "Entiende conceptos abstractos muy apropiadamente" },
                    { value: 0, text: "Bien", description: "Generalmente entiende conceptos abstractos" },
                    { value: 1, text: "Con dificultad", description: "Le cuesta entender conceptos abstractos" },
                    { value: 1, text: "Muy poco", description: "Comprensión muy limitada de conceptos abstractos" },
                    { value: 1, text: "No entiende", description: "No comprende conceptos abstractos apropiados para su edad" }
                ]
            },
            {
                id: 33,
                text: "¿Su hijo/a puede tolerar ruidos fuertes o ambientes ruidosos?",
                category: "sensory",
                subcategory: "noise_tolerance",
                options: [
                    { value: 0, text: "Muy bien", description: "Tolera ruidos y ambientes ruidosos muy bien" },
                    { value: 0, text: "Bien", description: "Generalmente tolera ruidos apropiadamente" },
                    { value: 1, text: "Con dificultad", description: "Le molestan los ruidos fuertes moderadamente" },
                    { value: 1, text: "Muy poco", description: "Muy sensible a ruidos" },
                    { value: 1, text: "No tolera", description: "No puede tolerar ruidos fuertes o ambientes ruidosos" }
                ]
            },
            {
                id: 34,
                text: "¿Su hijo/a puede seguir rutinas escolares sin apoyo excesivo?",
                category: "behavioral",
                subcategory: "school_routines",
                options: [
                    { value: 0, text: "Independientemente", description: "Sigue rutinas escolares completamente independiente" },
                    { value: 0, text: "Con apoyo mínimo", description: "Sigue rutinas con apoyo mínimo ocasional" },
                    { value: 1, text: "Con apoyo moderado", description: "Necesita apoyo moderado para rutinas escolares" },
                    { value: 1, text: "Con mucho apoyo", description: "Necesita mucho apoyo para seguir rutinas" },
                    { value: 1, text: "No puede sin apoyo intensivo", description: "No puede seguir rutinas sin apoyo intensivo constante" }
                ]
            },
            {
                id: 35,
                text: "¿Su hijo/a muestra comportamientos apropiados en diferentes contextos sociales?",
                category: "social",
                subcategory: "contextual_behavior",
                options: [
                    { value: 0, text: "Siempre apropiados", description: "Comportamiento siempre apropiado al contexto" },
                    { value: 0, text: "Generalmente apropiados", description: "Comportamiento generalmente apropiado al contexto" },
                    { value: 1, text: "A veces inapropiados", description: "Comportamiento ocasionalmente inapropiado al contexto" },
                    { value: 1, text: "Frecuentemente inapropiados", description: "Comportamiento frecuentemente inapropiado" },
                    { value: 1, text: "Consistentemente inapropiados", description: "Comportamiento consistentemente inapropiado al contexto" }
                ]
            }
        ]
    },
    
    categories: {
        social: { name: "Habilidades Sociales", icon: "👥", color: "#4299e1" },
        communication: { name: "Comunicación", icon: "💬", color: "#38b2ac" },
        play: { name: "Juego", icon: "🎮", color: "#ed8936" },
        behavioral: { name: "Comportamiento", icon: "🔄", color: "#9f7aea" },
        sensory: { name: "Sensorial", icon: "👂", color: "#48bb78" },
        motor: { name: "Motor", icon: "🏃", color: "#e53e3e" }
    }
};

// === ESTADO DEL QUIZ ===
class QChatQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.selectedAgeGroup = null;
        this.responses = {};
        this.startTime = null;
        this.endTime = null;
        this.totalScore = 0;
        this.categoryScores = {};
        this.currentScreen = 'welcome';
        
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Q-CHAT Quiz...');
        this.hideLoading();
        this.setupEventListeners();
        this.showScreen('welcome');
        console.log('✅ Q-CHAT Quiz inicializado correctamente');
    }

    // === GESTIÓN DE PANTALLAS ===
    showScreen(screenName) {
        console.log(`📱 Mostrando pantalla: ${screenName}`);
        
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar la pantalla solicitada
        const targetScreen = document.getElementById(`${screenName}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }

    // === EVENT LISTENERS ===
    setupEventListeners() {
        // Selección de grupo de edad
        document.querySelectorAll('.age-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectAgeGroup(btn.dataset.age));
        });

        // Botón de inicio
        const startBtn = document.getElementById('startQuizBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        // Navegación del quiz
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }

        // Modal de ayuda
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const closeHelpBtn = document.getElementById('closeHelpBtn');
        const helpOverlay = document.getElementById('helpOverlay');

        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => this.showModal('help'));
        }

        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => this.hideModal('help'));
        }

        if (helpOverlay) {
            helpOverlay.addEventListener('click', () => this.hideModal('help'));
        }

        // Acciones de resultados
        const newTestBtn = document.getElementById('newTestBtn');
        const printResultsBtn = document.getElementById('printResultsBtn');
        const shareResultsBtn = document.getElementById('shareResultsBtn');

        if (newTestBtn) {
            newTestBtn.addEventListener('click', () => this.resetQuiz());
        }

        if (printResultsBtn) {
            printResultsBtn.addEventListener('click', () => this.printResults());
        }

        if (shareResultsBtn) {
            shareResultsBtn.addEventListener('click', () => this.shareResults());
        }

        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // === SELECCIÓN DE GRUPO DE EDAD ===
    selectAgeGroup(ageGroup) {
        console.log(`👶 Seleccionando grupo de edad: ${ageGroup}`);
        
        // Remover selección anterior
        document.querySelectorAll('.age-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Marcar como seleccionado
        const selectedBtn = document.querySelector(`[data-age="${ageGroup}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            this.selectedAgeGroup = ageGroup;
            
            // Habilitar botón de inicio
            const startBtn = document.getElementById('startQuizBtn');
            if (startBtn) {
                startBtn.disabled = false;
            }
            
            // Feedback de audio
            if (CONFIG.audioFeedback) {
                this.playSound(600, 0.1);
            }
        }
    }

    // === INICIO DEL QUIZ ===
    startQuiz() {
        if (!this.selectedAgeGroup) {
            this.showNotification('Por favor selecciona un grupo de edad', 'warning');
            return;
        }

        console.log(`🎯 Iniciando quiz para grupo: ${this.selectedAgeGroup}`);
        
        this.startTime = Date.now();
        this.currentQuestion = 0;
        this.responses = {};
        this.totalScore = 0;
        this.categoryScores = {};

        // Inicializar puntuaciones por categoría
        Object.keys(QCHAT_DATA.categories).forEach(category => {
            this.categoryScores[category] = 0;
        });

        this.showScreen('quiz');
        this.displayQuestion();
    }

    // === MOSTRAR PREGUNTA ===
    displayQuestion() {
        const questions = QCHAT_DATA.questions[this.selectedAgeGroup];
        const question = questions[this.currentQuestion];
        const ageGroupData = QCHAT_DATA.ageGroups[this.selectedAgeGroup];

        if (!question) {
            console.error('❌ No se encontró la pregunta');
            return;
        }

        console.log(`❓ Mostrando pregunta ${this.currentQuestion + 1}: ${question.text}`);

        // Actualizar contador y progreso
        this.updateProgress();

        // Mostrar información de la pregunta
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('questionId').textContent = `Pregunta ${this.currentQuestion + 1}`;
        
        // Badge de categoría
        const categoryInfo = QCHAT_DATA.categories[question.category];
        const categoryBadge = document.getElementById('categoryBadge');
        if (categoryBadge && categoryInfo) {
            categoryBadge.textContent = `${categoryInfo.icon} ${categoryInfo.name}`;
            categoryBadge.style.backgroundColor = categoryInfo.color;
        }

        // Descripción de la pregunta (opcional)
        const questionDescription = document.getElementById('questionDescription');
        if (questionDescription) {
            questionDescription.textContent = question.description || '';
        }

        // Renderizar opciones
        this.renderOptions(question);

        // Actualizar botones de navegación
        this.updateNavigationButtons();

        // Scroll hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // === RENDERIZAR OPCIONES ===
    renderOptions(question) {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        container.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.dataset.value = option.value;
            optionBtn.dataset.index = index;

            // Verificar si esta opción está seleccionada
            const savedResponse = this.responses[question.id];
            if (savedResponse !== undefined && savedResponse.selectedIndex === index) {
                optionBtn.classList.add('selected');
            }

            optionBtn.innerHTML = `
                <div class="option-value">${option.text}</div>
                <div class="option-description">${option.description}</div>
            `;

            optionBtn.addEventListener('click', () => {
                this.selectOption(question.id, option.value, index, question.category);
            });

            container.appendChild(optionBtn);
        });
    }

    // === SELECCIONAR OPCIÓN ===
    selectOption(questionId, value, selectedIndex, category) {
        console.log(`✅ Seleccionando opción: Q${questionId} = ${value} (índice: ${selectedIndex})`);

        // Remover selección anterior
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Marcar como seleccionada
        const selectedBtn = document.querySelector(`[data-index="${selectedIndex}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }

        // Guardar respuesta
        this.responses[questionId] = {
            value: parseInt(value),
            selectedIndex: selectedIndex,
            category: category,
            timestamp: Date.now()
        };

        // Habilitar botón siguiente
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }

        // Feedback de audio
        if (CONFIG.audioFeedback) {
            this.playSound(800, 0.1);
        }

        // Auto-avance después de un breve delay (opcional)
        if (CONFIG.autoSave) {
            setTimeout(() => {
                // Solo auto-avanzar si el usuario no ha cambiado de pregunta
                const currentResponse = this.responses[questionId];
                if (currentResponse && currentResponse.selectedIndex === selectedIndex) {
                    // No hacer auto-avance en la última pregunta
                    const questions = QCHAT_DATA.questions[this.selectedAgeGroup];
                    if (this.currentQuestion < questions.length - 1) {
                        // Opcional: descomentar para auto-avance
                        // this.nextQuestion();
                    }
                }
            }, 800);
        }
    }

    // === ACTUALIZAR PROGRESO ===
    updateProgress() {
        const questions = QCHAT_DATA.questions[this.selectedAgeGroup];
        const totalQuestions = questions.length;
        const progress = ((this.currentQuestion + 1) / totalQuestions) * 100;

        // Actualizar elementos de progreso
        const questionCounter = document.getElementById('questionCounter');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressFill = document.getElementById('progressFill');

        if (questionCounter) {
            questionCounter.textContent = `${this.currentQuestion + 1} / ${totalQuestions}`;
        }

        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    // === NAVEGACIÓN ===
    nextQuestion() {
        const questions = QCHAT_DATA.questions[this.selectedAgeGroup];
        const currentQuestionData = questions[this.currentQuestion];

        // Verificar que hay una respuesta seleccionada
        if (!this.responses[currentQuestionData.id]) {
            this.showNotification('Por favor selecciona una respuesta antes de continuar', 'warning');
            return;
        }

        console.log(`➡️ Avanzando a la siguiente pregunta (${this.currentQuestion + 1} → ${this.currentQuestion + 2})`);

        if (this.currentQuestion < questions.length - 1) {
            this.currentQuestion++;
            this.displayQuestion();
        } else {
            this.completeQuiz();
        }

        // Feedback de audio
        if (CONFIG.audioFeedback) {
            this.playSound(700, 0.15);
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            console.log(`⬅️ Retrocediendo a la pregunta anterior (${this.currentQuestion + 1} → ${this.currentQuestion})`);
            this.currentQuestion--;
            this.displayQuestion();

            // Feedback de audio
            if (CONFIG.audioFeedback) {
                this.playSound(500, 0.15);
            }
        }
    }

    updateNavigationButtons() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const questions = QCHAT_DATA.questions[this.selectedAgeGroup];
        const currentQuestionData = questions[this.currentQuestion];

        // Botón anterior
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestion === 0;
        }

        // Botón siguiente
        if (nextBtn) {
            const hasResponse = this.responses[currentQuestionData.id] !== undefined;
            nextBtn.disabled = !hasResponse;
            
            // Cambiar texto en última pregunta
            if (this.currentQuestion === questions.length - 1) {
                nextBtn.textContent = 'Finalizar →';
            } else {
                nextBtn.textContent = 'Siguiente →';
            }
        }
    }

    // === COMPLETAR QUIZ ===
    completeQuiz() {
        this.endTime = Date.now();
        console.log('🏁 Completando quiz y calculando resultados...');

        // Calcular puntuaciones
        this.calculateScores();

        // Mostrar resultados
        this.showResults();

        // Feedback de audio de completación
        if (CONFIG.audioFeedback) {
            this.playCompletionSound();
        }
    }

    // === CALCULAR PUNTUACIONES ===
    calculateScores() {
        console.log('🔢 Calculando puntuaciones...');

        this.totalScore = 0;
        this.categoryScores = {};

        // Inicializar puntuaciones por categoría
        Object.keys(QCHAT_DATA.categories).forEach(category => {
            this.categoryScores[category] = { score: 0, total: 0 };
        });

        // Sumar puntuaciones
        Object.values(this.responses).forEach(response => {
            this.totalScore += response.value;
            
            if (this.categoryScores[response.category]) {
                this.categoryScores[response.category].score += response.value;
                this.categoryScores[response.category].total += 1;
            }
        });

        console.log('💯 Puntuación total:', this.totalScore);
        console.log('📊 Puntuaciones por categoría:', this.categoryScores);
    }

    // === MOSTRAR RESULTADOS ===
    showResults() {
        console.log('📋 Mostrando resultados...');

        const ageGroupData = QCHAT_DATA.ageGroups[this.selectedAgeGroup];
        const riskLevel = this.calculateRiskLevel(this.totalScore, ageGroupData.scoringThreshold);
        const duration = this.endTime - this.startTime;

        // Actualizar elementos de la pantalla de resultados
        this.updateResultsDisplay(riskLevel, ageGroupData, duration);

        // Mostrar pantalla de resultados
        this.showScreen('results');

        // Guardar resultados (opcional)
        if (CONFIG.autoSave) {
            this.saveResults();
        }
    }

    calculateRiskLevel(score, thresholds) {
        if (score >= thresholds.lowRisk.min && score <= thresholds.lowRisk.max) {
            return 'low';
        } else if (score >= thresholds.moderateRisk.min && score <= thresholds.moderateRisk.max) {
            return 'moderate';
        } else {
            return 'high';
        }
    }

    updateResultsDisplay(riskLevel, ageGroupData, duration) {
        // Icono y título de resultados
        const resultsIcon = document.getElementById('resultsIcon');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsSubtitle = document.getElementById('resultsSubtitle');

        const riskConfig = {
            low: {
                icon: '✅',
                title: 'Desarrollo Típico',
                subtitle: 'Las características observadas están dentro del rango esperado',
                class: 'low'
            },
            moderate: {
                icon: '⚠️',
                title: 'Algunas Características TEA',
                subtitle: 'Se observan algunas características que podrían requerir atención',
                class: 'moderate'
            },
            high: {
                icon: '🔍',
                title: 'Características Significativas TEA',
                subtitle: 'Se recomienda evaluación profesional adicional',
                class: 'high'
            }
        };

        const config = riskConfig[riskLevel];
        
        if (resultsIcon) resultsIcon.textContent = config.icon;
        if (resultsTitle) resultsTitle.textContent = config.title;
        if (resultsSubtitle) resultsSubtitle.textContent = config.subtitle;

        // Puntuación total
        const totalScore = document.getElementById('totalScore');
        const scoreRange = document.getElementById('scoreRange');
        
        if (totalScore) {
            totalScore.textContent = this.totalScore;
        }
        
        if (scoreRange) {
            scoreRange.textContent = `de ${ageGroupData.totalQuestions}`;
        }

        // Badge de riesgo
        const riskBadge = document.getElementById('riskLevel');
        const riskDescription = document.getElementById('riskDescription');
        
        if (riskBadge) {
            riskBadge.textContent = config.title;
            riskBadge.className = `risk-badge ${config.class}`;
        }
        
        if (riskDescription) {
            riskDescription.textContent = config.subtitle;
        }

        // Desglose por categorías
        this.displayCategoryBreakdown();

        // Interpretación y recomendaciones
        this.displayInterpretation(riskLevel, ageGroupData);
        this.displayRecommendations(riskLevel);
    }

    displayCategoryBreakdown() {
        const container = document.getElementById('categoriesContainer');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.categoryScores).forEach(([categoryKey, data]) => {
            const categoryInfo = QCHAT_DATA.categories[categoryKey];
            if (!categoryInfo || data.total === 0) return;

            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <div class="category-name">
                    ${categoryInfo.icon} ${categoryInfo.name}
                </div>
                <div class="category-score">
                    ${data.score}/${data.total}
                </div>
            `;
            
            container.appendChild(categoryItem);
        });
    }

    displayInterpretation(riskLevel, ageGroupData) {
        const container = document.getElementById('interpretationText');
        if (!container) return;

        const interpretations = {
            low: `
                <p>Los resultados sugieren que su hijo/a muestra un desarrollo típico en las áreas evaluadas por el Q-CHAT. 
                Las características observadas están dentro del rango esperado para niños de ${ageGroupData.ageRange}.</p>
                
                <p>Esto significa que las habilidades sociales, de comunicación y comportamentales evaluadas parecen 
                desarrollarse de manera apropiada para la edad.</p>
                
                <p><strong>Importante:</strong> Este resultado no descarta completamente la posibilidad de TEA, ya que 
                algunos niños pueden mostrar características más sutiles que requieren evaluación profesional especializada.</p>
            `,
            moderate: `
                <p>Los resultados indican que su hijo/a presenta algunas características que podrían estar asociadas 
                con el Trastorno del Espectro Autista (TEA), pero que se encuentran en un rango moderado.</p>
                
                <p>Esto sugiere que podría beneficiarse de:</p>
                <ul>
                    <li>Observación más detallada de su desarrollo</li>
                    <li>Estrategias de apoyo en casa y en el entorno educativo</li>
                    <li>Consulta con un profesional especializado si las características persisten o se intensifican</li>
                </ul>
                
                <p>Es importante recordar que todos los niños se desarrollan a su propio ritmo, y algunas características 
                pueden ser temporales o parte de la variabilidad normal del desarrollo.</p>
            `,
            high: `
                <p>Los resultados sugieren que su hijo/a presenta características significativas que están asociadas 
                con el Trastorno del Espectro Autista (TEA).</p>
                
                <p><strong>Se recomienda encarecidamente:</strong></p>
                <ul>
                    <li>Consulta con un pediatra especializado en desarrollo</li>
                    <li>Evaluación por un psicólogo clínico infantil o neuropsicólogo</li>
                    <li>Considerar evaluación multidisciplinaria completa</li>
                    <li>No esperar - la intervención temprana es clave</li>
                </ul>
                
                <p>Es importante recordar que un diagnóstico formal requiere evaluación profesional especializada, 
                pero estos resultados indican que sería beneficioso buscar esa evaluación pronto.</p>
            `
        };

        container.innerHTML = interpretations[riskLevel];
    }

    displayRecommendations(riskLevel) {
        const container = document.getElementById('recommendationsText');
        if (!container) return;

        const recommendations = {
            low: `
                <div class="recommendation-section">
                    <h4>🎯 Continúe el desarrollo típico:</h4>
                    <ul>
                        <li>Mantenga rutinas de juego interactivo y lectura</li>
                        <li>Fomente la comunicación y interacción social</li>
                        <li>Observe cualquier cambio en el desarrollo</li>
                        <li>Continúe con controles pediátricos regulares</li>
                    </ul>
                </div>
                
                <div class="recommendation-section">
                    <h4>📚 Recursos útiles:</h4>
                    <ul>
                        <li>Actividades de JuegoTEA para reforzar habilidades</li>
                        <li>Guías de desarrollo infantil</li>
                        <li>Grupos de juego con otros niños</li>
                    </ul>
                </div>
            `,
            moderate: `
                <div class="recommendation-section">
                    <h4>🎯 Estrategias de apoyo:</h4>
                    <ul>
                        <li>Establezca rutinas claras y predecibles</li>
                        <li>Use comunicación visual (imágenes, gestos)</li>
                        <li>Practique habilidades sociales en situaciones controladas</li>
                        <li>Fomente el juego estructurado e interactivo</li>
                    </ul>
                </div>
                
                <div class="recommendation-section">
                    <h4>👥 Apoyo profesional:</h4>
                    <ul>
                        <li>Consulte con el pediatra sobre estos hallazgos</li>
                        <li>Considere terapia de lenguaje si hay dificultades comunicativas</li>
                        <li>Busque grupos de apoyo para padres</li>
                        <li>Monitoree el progreso regularmente</li>
                    </ul>
                </div>
                
                <div class="recommendation-section">
                    <h4>🏠 En casa:</h4>
                    <ul>
                        <li>Use los juegos de JuegoTEA específicos para TEA</li>
                        <li>Practique contacto visual durante actividades divertidas</li>
                        <li>Celebre pequeños logros sociales</li>
                        <li>Mantenga un diario de observaciones</li>
                    </ul>
                </div>
            `,
            high: `
                <div class="recommendation-section urgent">
                    <h4>🚨 Acción inmediata recomendada:</h4>
                    <ul>
                        <li><strong>Contacte a su pediatra esta semana</strong></li>
                        <li>Solicite referencia a especialista en desarrollo</li>
                        <li>Documente comportamientos específicos observados</li>
                        <li>No espere - la intervención temprana es crucial</li>
                    </ul>
                </div>
                
                <div class="recommendation-section">
                    <h4>🏥 Evaluación profesional:</h4>
                    <ul>
                        <li>Psicólogo clínico infantil especializado en TEA</li>
                        <li>Neuropsicólogo pediátrico</li>
                        <li>Equipo multidisciplinario (si está disponible)</li>
                        <li>Evaluación del habla y lenguaje</li>
                    </ul>
                </div>
                
                <div class="recommendation-section">
                    <h4>🎯 Mientras tanto, en casa:</h4>
                    <ul>
                        <li>Mantenga rutinas muy consistentes</li>
                        <li>Use comunicación simple y clara</li>
                        <li>Reduzca estímulos sensoriales abrumadores</li>
                        <li>Practique habilidades sociales básicas</li>
                        <li>Use los recursos especializados de JuegoTEA</li>
                    </ul>
                </div>
                
                <div class="recommendation-section">
                    <h4>📞 Recursos de apoyo:</h4>
                    <ul>
                        <li>Asociaciones locales de autismo</li>
                        <li>Grupos de apoyo para padres</li>
                        <li>Recursos educativos especializados</li>
                        <li>Servicios de intervención temprana</li>
                    </ul>
                </div>
            `
        };

        container.innerHTML = recommendations[riskLevel];
    }

    // === UTILIDADES ===
    showModal(modalName) {
        const modal = document.getElementById(`${modalName}Modal`);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalName) {
        const modal = document.getElementById(`${modalName}Modal`);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        // Cerrar notificación
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        container.appendChild(notification);

        // Auto-cerrar
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    handleKeyPress(e) {
        if (this.currentScreen === 'quiz') {
            // Navegación con teclado
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                const nextBtn = document.getElementById('nextBtn');
                if (nextBtn && !nextBtn.disabled) {
                    this.nextQuestion();
                }
            } else if (e.key === 'ArrowLeft') {
                const prevBtn = document.getElementById('prevBtn');
                if (prevBtn && !prevBtn.disabled) {
                    this.previousQuestion();
                }
            }
            // Selección de opciones con números
            else if (e.key >= '1' && e.key <= '5') {
                const optionIndex = parseInt(e.key) - 1;
                const optionBtn = document.querySelector(`[data-index="${optionIndex}"]`);
                if (optionBtn) {
                    optionBtn.click();
                }
            }
        }
        
        // Cerrar modales con Escape
        if (e.key === 'Escape') {
            this.hideModal('help');
        }
    }

    // === AUDIO ===
    playSound(frequency, duration, type = 'sine') {
        if (!CONFIG.audioFeedback) return;
        
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
            console.log('🔇 Audio no disponible:', error);
        }
    }

    playCompletionSound() {
        if (!CONFIG.audioFeedback) return;
        
        // Secuencia de tonos para indicar completación
        const notes = [523, 659, 784]; // Do, Mi, Sol
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 0.3);
            }, index * 200);
        });
    }

    // === ACCIONES DE RESULTADOS ===
    resetQuiz() {
        if (confirm('¿Estás seguro de que quieres comenzar una nueva evaluación? Se perderán los resultados actuales.')) {
            console.log('🔄 Reiniciando quiz...');
            
            this.currentQuestion = 0;
            this.selectedAgeGroup = null;
            this.responses = {};
            this.startTime = null;
            this.endTime = null;
            this.totalScore = 0;
            this.categoryScores = {};
            
            // Resetear UI
            document.querySelectorAll('.age-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            const startBtn = document.getElementById('startQuizBtn');
            if (startBtn) {
                startBtn.disabled = true;
            }
            
            this.showScreen('welcome');
            
            // Feedback
            this.showNotification('Quiz reiniciado. Selecciona un grupo de edad para comenzar.', 'info');
        }
    }

    printResults() {
        console.log('🖨️ Imprimiendo resultados...');
        
        // Ocultar elementos no imprimibles temporalmente
        const nonPrintElements = document.querySelectorAll('.results-actions, .navigation-controls, .header');
        nonPrintElements.forEach(el => el.style.display = 'none');
        
        // Imprimir
        window.print();
        
        // Restaurar elementos
        setTimeout(() => {
            nonPrintElements.forEach(el => el.style.display = '');
        }, 100);
    }

    async shareResults() {
        console.log('📤 Compartiendo resultados...');
        
        const ageGroupData = QCHAT_DATA.ageGroups[this.selectedAgeGroup];
        const riskLevel = this.calculateRiskLevel(this.totalScore, ageGroupData.scoringThreshold);
        
        const shareText = `Resultados Q-CHAT (${ageGroupData.name}):
Puntuación: ${this.totalScore}/${ageGroupData.totalQuestions}
Nivel de riesgo: ${riskLevel === 'low' ? 'Bajo' : riskLevel === 'moderate' ? 'Moderado' : 'Alto'}

Completado en JuegoTEA - Plataforma educativa para TEA`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Resultados Q-CHAT',
                    text: shareText,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error compartiendo:', error);
                this.fallbackShare(shareText);
            }
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        // Copiar al portapapeles como fallback
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Resultados copiados al portapapeles', 'success');
            }).catch(() => {
                this.showTextModal('Compartir Resultados', text);
            });
        } else {
            this.showTextModal('Compartir Resultados', text);
        }
    }

    showTextModal(title, text) {
        // Modal simple para mostrar texto copiable
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <textarea readonly style="width: 100%; height: 200px; resize: vertical;">${text}</textarea>
                    <p style="margin-top: 1rem; color: #666;">Selecciona el texto de arriba y cópialo (Ctrl+C o Cmd+C)</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Cerrar modal
        const closeBtn = modal.querySelector('.close-btn');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Seleccionar texto automáticamente
        const textarea = modal.querySelector('textarea');
        textarea.select();
        textarea.focus();
    }

    // === GUARDAR RESULTADOS ===
    saveResults() {
        try {
            const results = {
                timestamp: new Date().toISOString(),
                version: CONFIG.version,
                ageGroup: this.selectedAgeGroup,
                totalScore: this.totalScore,
                categoryScores: this.categoryScores,
                responses: this.responses,
                duration: this.endTime - this.startTime,
                riskLevel: this.calculateRiskLevel(
                    this.totalScore, 
                    QCHAT_DATA.ageGroups[this.selectedAgeGroup].scoringThreshold
                )
            };

            // Guardar en localStorage
            localStorage.setItem('qchat_last_results', JSON.stringify(results));
            
            // Mantener historial (últimos 5 resultados)
            const history = JSON.parse(localStorage.getItem('qchat_history') || '[]');
            history.unshift(results);
            
            if (history.length > 5) {
                history.splice(5);
            }
            
            localStorage.setItem('qchat_history', JSON.stringify(history));
            
            console.log('💾 Resultados guardados correctamente');
            
        } catch (error) {
            console.error('❌ Error guardando resultados:', error);
        }
    }

    // === ANALYTICS (OPCIONAL) ===
    trackEvent(eventName, data = {}) {
        if (!CONFIG.enableAnalytics) return;
        
        console.log('📊 Analytics:', eventName, data);
        
        // Aquí se podría integrar con Google Analytics, etc.
        // gtag('event', eventName, data);
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 DOM cargado, inicializando Q-CHAT...');
    
    // Verificar compatibilidad del navegador
    if (!window.localStorage) {
        console.warn('⚠️ LocalStorage no disponible');
    }
    
    if (!window.fetch) {
        console.warn('⚠️ Fetch API no disponible');
    }
    
    // Inicializar quiz
    window.qchatQuiz = new QChatQuiz();
    
    // Registrar service worker para PWA (si está disponible)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../sw.js').then(() => {
            console.log('✅ Service Worker registrado');
        }).catch(err => {
            console.log('❌ Service Worker falló:', err);
        });
    }
    
    console.log('🚀 Q-CHAT Quiz completamente inicializado');
});

// === MANEJO DE ERRORES GLOBALES ===
window.addEventListener('error', (e) => {
    console.error('❌ Error global:', e.error);
    
    if (window.qchatQuiz) {
        window.qchatQuiz.showNotification(
            'Ha ocurrido un error. Por favor, recarga la página.', 
            'error'
        );
    }
});

// === PREVENIR PÉRDIDA DE DATOS ===
window.addEventListener('beforeunload', (e) => {
    if (window.qchatQuiz && 
        window.qchatQuiz.currentScreen === 'quiz' && 
        Object.keys(window.qchatQuiz.responses).length > 0) {
        
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Se perderá el progreso del cuestionario.';
        return e.returnValue;
    }
});

console.log('📋 Q-CHAT Quiz JavaScript cargado completamente ✅');