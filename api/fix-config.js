// 🔧 fix-config.js - Corrección completa para modo producción
// Ejecutar: node fix-config.js

const fs = require('fs').promises;
const path = require('path');

console.log('🧩 JuegoTEA - Corrección de Configuración para Producción\n');

async function fixServerConfig() {
  console.log('📋 1. CORRIGIENDO SERVIDOR (server.js)...\n');
  
  const serverPath = path.join(__dirname, 'server.js');
  
  try {
    let serverContent = await fs.readFile(serverPath, 'utf8');
    
    // 1. Asegurar que no haya sandbox hardcodeado
    if (serverContent.includes('sandbox: true')) {
      console.log('🔧 Removiendo sandbox: true del código...');
      serverContent = serverContent.replace(/sandbox:\s*true,?\s*/g, '');
    }
    
    // 2. Corregir configuración de MercadoPago
    const correctMPConfig = `
// === CONFIGURACIÓN DE MERCADOPAGO ===
let mercadopagoClient = null;
let mercadopagoConfig = validateMercadoPagoConfig();

if (mercadopagoConfig.valid) {
  try {
    const { MercadoPagoConfig } = require('mercadopago');
    mercadopagoClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      // En producción, NO incluir sandbox: true
      options: {
        timeout: 10000,
        retries: 3
      }
    });
    log('success', 'CONFIG', \`MercadoPago configurado en modo \${mercadopagoConfig.environment}\`);
  } catch (error) {
    log('error', 'CONFIG', 'Error configurando MercadoPago', error);
    mercadopagoConfig.valid = false;
  }
}`;
    
    // 3. Buscar y reemplazar la configuración de MercadoPago
    const mpConfigRegex = /\/\/ === CONFIGURACIÓN DE MERCADOPAGO ===[\s\S]*?}/m;
    if (serverContent.match(mpConfigRegex)) {
      serverContent = serverContent.replace(mpConfigRegex, correctMPConfig);
      console.log('✅ Configuración de MercadoPago corregida');
    }
    
    // 4. Verificar URLs de producción
    const frontendUrl = 'https://juegostea.onrender.com';
    const apiUrl = 'https://api-juegostea.onrender.com';
    
    // Reemplazar URLs hardcodeadas
    serverContent = serverContent.replace(/https?:\/\/localhost:\d+/g, frontendUrl);
    serverContent = serverContent.replace(/http:\/\/127\.0\.0\.1:\d+/g, frontendUrl);
    
    console.log('✅ URLs de localhost reemplazadas por URLs de producción');
    
    // 5. Guardar archivo corregido
    await fs.writeFile(serverPath, serverContent, 'utf8');
    console.log('✅ server.js actualizado correctamente\n');
    
  } catch (error) {
    console.log('❌ Error corrigiendo server.js:', error.message);
  }
}

async function fixAuthConfig() {
  console.log('📋 2. CORRIGIENDO FRONTEND (auth.js)...\n');
  
  const authPath = path.join(__dirname, '..', 'js', 'auth.js');
  
  try {
    let authContent = await fs.readFile(authPath, 'utf8');
    
    // Corregir lógica de determinación de URL de checkout
    const correctCheckoutLogic = `
        // Determinar URL de checkout - SOLO producción si tienes token APP_USR-
        const isProduction = process.env.NODE_ENV === 'production' || 
                           window.location.hostname !== 'localhost';
        
        const checkoutUrl = isProduction && data.init_point 
          ? data.init_point 
          : data.sandbox_init_point || data.init_point;

        if (!checkoutUrl) {
          throw new Error('No se recibió URL de checkout de MercadoPago');
        }

        console.log('🔗 URL de checkout:', checkoutUrl);
        console.log('🏷️ Modo:', isProduction ? 'PRODUCCIÓN' : 'PRUEBA');`;
    
    // Buscar y reemplazar la lógica de checkout
    const checkoutRegex = /\/\/ Determinar URL de checkout[\s\S]*?console\.log\('🔗 URL de checkout:', checkoutUrl\);/m;
    if (authContent.match(checkoutRegex)) {
      authContent = authContent.replace(checkoutRegex, correctCheckoutLogic);
      console.log('✅ Lógica de checkout corregida');
    }
    
    await fs.writeFile(authPath, authContent, 'utf8');
    console.log('✅ auth.js actualizado correctamente\n');
    
  } catch (error) {
    console.log('❌ Error corrigiendo auth.js:', error.message);
  }
}

async function createEnvTemplate() {
  console.log('📋 3. CREANDO TEMPLATE DE VARIABLES DE ENTORNO...\n');
  
  const envTemplate = `# 🧩 JuegoTEA - Variables de Entorno para PRODUCCIÓN
# ⚠️  IMPORTANTE: Usa estas configuraciones exactas en Render

# Entorno - DEBE ser "production" para pagos reales
NODE_ENV=production

# MercadoPago - Token de PRODUCCIÓN (empieza con APP_USR-)
# ❌ NO uses tokens TEST- en producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxx

# URLs de la aplicación
FRONTEND_URL=https://juegostea.onrender.com
API_URL=https://api-juegostea.onrender.com

# Puerto (Render lo maneja automáticamente)
PORT=3000

# === INSTRUCCIONES ===
# 1. Ve a tu panel de MercadoPago → Integraciones → Credenciales
# 2. En la sección "Producción", copia tu Access Token
# 3. Pega el token en MERCADOPAGO_ACCESS_TOKEN
# 4. Configura estas variables en Render:
#    - Dashboard → Tu servicio → Environment
#    - Añadir cada variable una por una
# 5. Reinicia el servicio después de actualizar`;

  try {
    await fs.writeFile('.env.production', envTemplate, 'utf8');
    console.log('✅ Plantilla .env.production creada');
    console.log('📝 Revisa el archivo .env.production para las instrucciones\n');
  } catch (error) {
    console.log('❌ Error creando plantilla:', error.message);
  }
}

async function generateRenderConfig() {
  console.log('📋 4. GENERANDO CONFIGURACIÓN PARA RENDER...\n');
  
  const renderInstructions = `# 🚀 Configuración para Render - JuegoTEA

## Variables de Entorno en Render

Ve a tu dashboard de Render → Tu servicio → Environment y configura:

\`\`\`
NODE_ENV=production
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-de-produccion-aqui
FRONTEND_URL=https://juegostea.onrender.com
API_URL=https://api-juegostea.onrender.com
PORT=3000
\`\`\`

## ⚠️ Pasos Críticos:

### 1. Obtener Token de Producción
- Ve a [MercadoPago Developers](https://www.mercadopago.com/developers/panel)
- Navega a: **Integraciones → Credenciales**
- En la sección **"Producción"** (NO "Pruebas")
- Copia tu **Access Token** (empieza con \`APP_USR-\`)

### 2. Configurar en Render
- Dashboard → Tu servicio API → **Environment**
- Haz clic en **"Add Environment Variable"**
- Añade cada variable una por una
- **NO pongas comillas** alrededor de los valores

### 3. Verificar Configuración
- Después de guardar las variables
- Ve a **"Deploy"** → **"Redeploy"**
- Espera a que el deploy termine
- Revisa los logs para confirmar: "MercadoPago configurado en modo production"

### 4. Probar Pago Real
- Usa una tarjeta real (NO tarjetas de prueba)
- El error "Una de las partes es de prueba" debe desaparecer
- El pago debe procesarse correctamente

## 🔍 Solución de Problemas

Si sigues viendo el error:
1. Verifica que tu token empiece con \`APP_USR-\`
2. Confirma que \`NODE_ENV=production\`
3. Reinicia completamente el servicio
4. Revisa los logs del servidor

## 📞 Contacto
Si necesitas ayuda: [soporte@juegotea.com](mailto:soporte@juegotea.com)
`;

  try {
    await fs.writeFile('RENDER-CONFIG.md', renderInstructions, 'utf8');
    console.log('✅ Guía RENDER-CONFIG.md creada');
    console.log('📖 Lee RENDER-CONFIG.md para configurar Render correctamente\n');
  } catch (error) {
    console.log('❌ Error creando guía:', error.message);
  }
}

async function main() {
  try {
    await fixServerConfig();
    await fixAuthConfig();
    await createEnvTemplate();
    await generateRenderConfig();
    
    console.log('🎯 RESUMEN DE CORRECCIONES:');
    console.log('✅ server.js corregido para producción');
    console.log('✅ auth.js actualizado');
    console.log('✅ Plantilla .env.production creada');
    console.log('✅ Guía RENDER-CONFIG.md generada');
    console.log('');
    console.log('🚀 PRÓXIMOS PASOS:');
    console.log('1. Revisa el archivo RENDER-CONFIG.md');
    console.log('2. Configura las variables de entorno en Render');
    console.log('3. Redeploy tu servicio');
    console.log('4. Prueba un pago real');
    console.log('');
    console.log('💡 El error "Una de las partes es de prueba" debe desaparecer');
    
  } catch (error) {
    console.log('❌ Error ejecutando correcciones:', error.message);
  }
}

main();