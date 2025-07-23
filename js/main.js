// 🧩 JuegoTEA - JavaScript principal
console.log('🧩 JuegoTEA cargado correctamente');

// Configuración global
const JuegoTEA = {
    version: '1.0.0',
    settings: {
        soundEnabled: true,
        speechRate: 0.8,
        theme: 'default'
    }
};

// Función de síntesis de voz
function speakText(text) {
    if (!JuegoTEA.settings.soundEnabled || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = JuegoTEA.settings.speechRate;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    console.log([] );
    // Implementar notificaciones visuales aquí
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ JuegoTEA inicializado');
    showNotification('¡Bienvenido a JuegoTEA! 🎮');
});
