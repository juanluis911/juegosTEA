// 📱 Sistema de Instalación PWA para JuegoTEA
console.log('📱 PWA Install Manager cargado');

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.installButton = null;
        
        this.init();
    }
    
    init() {
        this.checkInstallation();
        this.setupEventListeners();
        this.createInstallPrompt();
        this.detectStandaloneMode();
    }
    
    // === DETECCIÓN DE INSTALACIÓN ===
    checkInstallation() {
        // Verificar si ya está instalado
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ PWA ya está instalada');
            this.hideInstallPrompt();
            return;
        }
        
        // Verificar soporte PWA
        if (!('serviceWorker' in navigator)) {
            console.log('❌ Service Worker no soportado');
            return;
        }
        
        if (!('BeforeInstallPromptEvent' in window)) {
            console.log('⚠️ Install prompt no soportado - usando fallback');
            this.showFallbackInstructions();
        }
    }
    
    // === CONFIGURACIÓN DE EVENTOS ===
    setupEventListeners() {
        // Evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt disparado');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // Evento appinstalled
        window.addEventListener('appinstalled', (e) => {
            console.log('✅ PWA instalada exitosamente');
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.showSuccessMessage();
            
            // Analytics (opcional)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_installed', {
                    event_category: 'PWA',
                    event_label: 'JuegoTEA'
                });
            }
        });
        
        // Detectar cambios en display-mode
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            if (e.matches) {
                console.log('📱 Aplicación abierta en modo standalone');
                this.handleStandaloneMode();
            }
        });
    }
    
    // === CREAR BOTÓN DE INSTALACIÓN ===
    createInstallPrompt() {
        // Crear botón de instalación
        this.installButton = document.createElement('button');
        this.installButton.id = 'pwa-install-btn';
        this.installButton.className = 'pwa-install-button hidden';
        this.installButton.innerHTML = `
            <span class="install-icon">📱</span>
            <span class="install-text">Instalar App</span>
        `;
        
        // Estilos del botón
        const styles = `
            .pwa-install-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(45deg, #4299e1, #63b3ed);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 12px 20px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(66, 153, 225, 0.4);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                font-size: 14px;
                max-width: 150px;
            }
            
            .pwa-install-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(66, 153, 225, 0.6);
            }
            
            .pwa-install-button.hidden {
                display: none;
            }
            
            .install-icon {
                font-size: 18px;
            }
            
            @media (max-width: 480px) {
                .pwa-install-button {
                    bottom: 10px;
                    right: 10px;
                    padding: 10px 16px;
                    font-size: 13px;
                }
            }
            
            /* Banner de instalación */
            .pwa-install-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(45deg, #48bb78, #68d391);
                color: white;
                padding: 12px 20px;
                text-align: center;
                z-index: 1001;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            }
            
            .pwa-install-banner.show {
                transform: translateY(0);
            }
            
            .banner-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .banner-text {
                flex: 1;
                font-weight: 600;
            }
            
            .banner-buttons {
                display: flex;
                gap: 10px;
            }
            
            .banner-btn {
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 6px 12px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.3s ease;
            }
            
            .banner-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .banner-btn.primary {
                background: rgba(255,255,255,0.9);
                color: #48bb78;
                font-weight: bold;
            }
        `;
        
        // Añadir estilos
        if (!document.getElementById('pwa-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'pwa-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        // Evento click
        this.installButton.addEventListener('click', () => {
            this.promptInstall();
        });
        
        document.body.appendChild(this.installButton);
    }
    
    // === MOSTRAR/OCULTAR PROMPTS ===
    showInstallPrompt() {
        if (this.isInstalled) return;
        
        this.installButton?.classList.remove('hidden');
        
        // Mostrar banner después de 5 segundos
        setTimeout(() => {
            this.showInstallBanner();
        }, 5000);
    }
    
    hideInstallPrompt() {
        this.installButton?.classList.add('hidden');
        this.hideBanner();
    }
    
    showInstallBanner() {
        if (this.isInstalled || document.getElementById('pwa-banner')) return;
        
        const banner = document.createElement('div');
        banner.id = 'pwa-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-text">
                    📱 Instala JuegoTEA para acceso rápido y uso sin conexión
                </div>
                <div class="banner-buttons">
                    <button class="banner-btn primary" onclick="pwaInstaller.promptInstall()">
                        Instalar
                    </button>
                    <button class="banner-btn" onclick="pwaInstaller.hideBanner()">
                        Ahora no
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Mostrar con animación
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            this.hideBanner();
        }, 10000);
    }
    
    hideBanner() {
        const banner = document.getElementById('pwa-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }
    
    // === INSTALACIÓN ===
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('⚠️ No hay prompt diferido - mostrando instrucciones');
            this.showFallbackInstructions();
            return;
        }
        
        try {
            // Mostrar prompt nativo
            this.deferredPrompt.prompt();
            
            // Esperar respuesta del usuario
            const choiceResult = await this.deferredPrompt.userChoice;
            
            console.log('👤 Elección del usuario:', choiceResult.outcome);
            
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ Usuario aceptó la instalación');
                this.hideInstallPrompt();
                
                // Mostrar mensaje de progreso
                showNotification('Instalando JuegoTEA...', 'info');
            } else {
                console.log('❌ Usuario rechazó la instalación');
                showNotification('Puedes instalar más tarde desde el menú del navegador', 'info');
            }
            
            // Limpiar prompt
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('❌ Error en la instalación:', error);
            this.showFallbackInstructions();
        }
    }
    
    // === INSTRUCCIONES MANUALES ===
    showFallbackInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                Para instalar JuegoTEA en iOS:
                
                1. Toca el botón "Compartir" 📤
                2. Selecciona "Añadir a pantalla de inicio"
                3. Toca "Añadir" para confirmar
                
                ¡La app aparecerá en tu pantalla de inicio!
            `;
        } else if (isAndroid) {
            instructions = `
                Para instalar JuegoTEA en Android:
                
                1. Toca el menú del navegador (⋮)
                2. Selecciona "Añadir a pantalla de inicio"
                3. Toca "Añadir" para confirmar
                
                ¡La app aparecerá en tu pantalla de inicio!
            `;
        } else {
            instructions = `
                Para instalar JuegoTEA:
                
                1. Busca el ícono de instalación en la barra de direcciones
                2. O ve al menú del navegador
                3. Selecciona "Instalar JuegoTEA"
                
                ¡Tendrás acceso directo desde tu escritorio!
            `;
        }
        
        if (confirm(`${instructions}\n\n¿Quieres ver estas instrucciones ahora?`)) {
            this.showInstructionsModal(instructions);
        }
    }
    
    showInstructionsModal(instructions) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                margin: 20px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-bottom: 20px; color: #2d3748;">
                    📱 Instalar JuegoTEA
                </h3>
                <p style="white-space: pre-line; line-height: 1.6; margin-bottom: 20px;">
                    ${instructions}
                </p>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #4299e1;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    Entendido
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // === MODO STANDALONE ===
    detectStandaloneMode() {
        if (this.isInstalled) {
            this.handleStandaloneMode();
        }
    }
    
    handleStandaloneMode() {
        console.log('📱 Ejecutándose en modo standalone');
        
        // Añadir clase CSS para modo app
        document.body.classList.add('pwa-standalone');
        
        // Ocultar elementos específicos del navegador
        this.hideInstallPrompt();
        
        // Mostrar mensaje de bienvenida (solo la primera vez)
        if (!localStorage.getItem('pwa-welcome-shown')) {
            setTimeout(() => {
                showNotification('¡Bienvenido a la app JuegoTEA! 🎉', 'success');
                localStorage.setItem('pwa-welcome-shown', 'true');
            }, 1000);
        }
    }
    
    // === MENSAJES ===
    showSuccessMessage() {
        showNotification('¡JuegoTEA instalado exitosamente! 🎉', 'success');
        
        setTimeout(() => {
            showNotification('Ahora puedes acceder desde tu pantalla de inicio', 'info');
        }, 2000);
    }
}

// === INICIALIZACIÓN ===
let pwaInstaller;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar PWA installer
    pwaInstaller = new PWAInstaller();
    
    // Hacer disponible globalmente
    window.pwaInstaller = pwaInstaller;
});

// === UTILIDADES ADICIONALES ===

// Verificar si la app está instalada
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

// Obtener información de la instalación
function getInstallationInfo() {
    return {
        isInstalled: isAppInstalled(),
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        supportsServiceWorker: 'serviceWorker' in navigator,
        supportsInstallPrompt: 'BeforeInstallPromptEvent' in window
    };
}

console.log('✅ PWA Install Manager cargado completamente');
console.log('📊 Info de instalación:', getInstallationInfo());