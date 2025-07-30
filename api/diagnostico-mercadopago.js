// diagnostico-mercadopago.js
// Ejecutar con: node diagnostico-mercadopago.js

require('dotenv').config();

async function diagnosticarMercadoPago() {
  console.log('🔍 DIAGNÓSTICO MERCADOPAGO\n');
  
  // 1. Verificar variables de entorno
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
  const nodeEnv = process.env.NODE_ENV;
  
  console.log('📋 VARIABLES DE ENTORNO:');
  console.log(`NODE_ENV: ${nodeEnv}`);
  console.log(`Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NO CONFIGURADO'}`);
  console.log(`Public Key: ${publicKey ? publicKey.substring(0, 20) + '...' : 'NO CONFIGURADO'}`);
  console.log('');
  
  // 2. Detectar tipo de credenciales
  let tokenType = 'DESCONOCIDO';
  let publicKeyType = 'DESCONOCIDO';
  
  if (accessToken) {
    if (accessToken.startsWith('TEST-')) {
      tokenType = 'SANDBOX';
    } else if (accessToken.startsWith('APP_USR-')) {
      tokenType = 'PRODUCCIÓN';
    }
  }
  
  if (publicKey) {
    if (publicKey.startsWith('TEST-')) {
      publicKeyType = 'SANDBOX';
    } else if (publicKey.startsWith('APP_USR-')) {
      publicKeyType = 'PRODUCCIÓN';
    }
  }
  
  console.log('🔑 TIPO DE CREDENCIALES:');
  console.log(`Access Token: ${tokenType}`);
  console.log(`Public Key: ${publicKeyType}`);
  console.log('');
  
  // 3. Verificar consistencia
  const esConsistente = tokenType === publicKeyType;
  console.log('✅ CONSISTENCIA:');
  if (esConsistente) {
    console.log(`✅ Las credenciales son consistentes (ambas ${tokenType})`);
  } else {
    console.log('❌ PROBLEMA DETECTADO: Credenciales inconsistentes');
    console.log(`   Access Token: ${tokenType}`);
    console.log(`   Public Key: ${publicKeyType}`);
    console.log('   ESTO CAUSA EL ERROR "Una de las partes es de prueba"');
  }
  console.log('');
  
  // 4. Probar conexión con MercadoPago
  if (accessToken && esConsistente) {
    console.log('🌐 PROBANDO CONEXIÓN CON MERCADOPAGO...');
    try {
      const { MercadoPagoConfig } = require('mercadopago');
      const client = new MercadoPagoConfig({ 
        accessToken: accessToken 
      });
      
      // Intentar obtener información de la cuenta
      const response = await fetch('https://api.mercadopago.com/v1/account/settings', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Conexión exitosa con MercadoPago`);
        console.log(`📧 Email de la cuenta: ${data.email || 'No disponible'}`);
        console.log(`🆔 ID de la cuenta: ${data.user_id || 'No disponible'}`);
      } else {
        console.log(`❌ Error de conexión: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error probando conexión: ${error.message}`);
    }
  }
  
  // 5. Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  
  if (!esConsistente) {
    console.log('🔧 SOLUCIÓN INMEDIATA:');
    console.log('1. Asegúrate de que AMBAS credenciales sean del mismo tipo:');
    console.log('   - Para pruebas: ambas deben empezar con "TEST-"');
    console.log('   - Para producción: ambas deben empezar con "APP_USR-"');
    console.log('');
    console.log('2. Si quieres hacer PRUEBAS SEGURAS:');
    console.log('   - Usa credenciales de SANDBOX (TEST-)');
    console.log('   - Crea usuarios de prueba');
    console.log('   - Usa tarjetas de prueba');
    console.log('');
    console.log('3. Si quieres PAGOS REALES:');
    console.log('   - Usa credenciales de PRODUCCIÓN (APP_USR-)');
    console.log('   - Configura el webhook correctamente');
    console.log('   - Verifica tu cuenta de MercadoPago');
  } else if (tokenType === 'SANDBOX') {
    console.log('🧪 Estás en modo SANDBOX - perfecto para pruebas');
    console.log('📝 Para completar las pruebas necesitas:');
    console.log('   - Crear usuarios de prueba desde tu cuenta principal');
    console.log('   - Usar datos de tarjetas de prueba');
    console.log('   - Acceder al sandbox_init_point, no al init_point');
  } else if (tokenType === 'PRODUCCIÓN') {
    console.log('💳 Estás en modo PRODUCCIÓN - pagos reales');
    console.log('⚠️  CUIDADO: Los pagos serán reales');
    console.log('📝 Verifica que:');
    console.log('   - Tu cuenta esté verificada');
    console.log('   - El webhook esté configurado');
    console.log('   - Los usuarios usen datos reales');
  }
}

// Ejecutar diagnóstico
diagnosticarMercadoPago().catch(console.error);