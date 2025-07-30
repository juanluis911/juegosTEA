// 🔧 Script para diagnosticar y arreglar MercadoPago
// Ejecutar con: node fix-mercadopago.js

console.log('🔧 Diagnosticando instalación de MercadoPago...\n');

// 1. Verificar si MercadoPago está instalado
try {
  const mercadopago = require('mercadopago');
  console.log('✅ MercadoPago SDK encontrado');
  
  // 2. Verificar estructura del SDK
  console.log('\n📋 Estructura del SDK:');
  console.log('- MercadoPagoConfig:', !!mercadopago.MercadoPagoConfig);
  console.log('- Preference:', !!mercadopago.Preference);
  console.log('- configure:', !!mercadopago.configure);
  console.log('- preferences:', !!mercadopago.preferences);
  
  // 3. Mostrar todas las claves disponibles
  console.log('\n🔍 Métodos/clases disponibles:');
  Object.keys(mercadopago).forEach(key => {
    console.log(`- ${key}: ${typeof mercadopago[key]}`);
  });
  
  // 4. Verificar versión
  try {
    const packageInfo = require('mercadopago/package.json');
    console.log(`\n📦 Versión instalada: ${packageInfo.version}`);
  } catch (e) {
    console.log('\n⚠️  No se pudo determinar la versión');
  }
  
  // 5. Test de configuración
  console.log('\n🧪 Probando configuración...');
  
  const testToken = 'TEST-1234567890123456-123456-abc123def456ghi789jkl012mno345pqr-123456789';
  
  try {
    if (mercadopago.MercadoPagoConfig) {
      // SDK v2.x
      console.log('🔄 Probando configuración SDK v2.x...');
      const config = new mercadopago.MercadoPagoConfig({
        accessToken: testToken
      });
      console.log('✅ SDK v2.x configurado correctamente');
    } else if (mercadopago.configure) {
      // SDK v1.x
      console.log('🔄 Probando configuración SDK v1.x...');
      mercadopago.configure({
        access_token: testToken
      });
      console.log('✅ SDK v1.x configurado correctamente');
    } else {
      console.log('❌ No se encontró método de configuración válido');
    }
  } catch (configError) {
    console.log('❌ Error en configuración:', configError.message);
  }
  
} catch (error) {
  console.log('❌ MercadoPago SDK no encontrado o error al importar:');
  console.log('   Error:', error.message);
  console.log('\n💡 Soluciones:');
  console.log('1. Instalar MercadoPago: npm install mercadopago@latest');
  console.log('2. Verificar package.json tiene "mercadopago" en dependencies');
  console.log('3. Ejecutar: npm install para instalar dependencias');
}

console.log('\n='.repeat(60));
console.log('🎯 RECOMENDACIONES:');

// Verificar package.json
try {
  const pkg = require('./package.json');
  const mpVersion = pkg.dependencies?.mercadopago || pkg.devDependencies?.mercadopago;
  
  if (!mpVersion) {
    console.log('❌ MercadoPago no está en package.json');
    console.log('   Ejecuta: npm install mercadopago@latest --save');
  } else {
    console.log(`✅ MercadoPago en package.json: ${mpVersion}`);
    
    if (mpVersion.includes('1.')) {
      console.log('⚠️  Versión 1.x detectada, considera actualizar a 2.x');
      console.log('   Ejecuta: npm install mercadopago@latest --save');
    }
  }
} catch (e) {
  console.log('⚠️  No se pudo leer package.json desde este directorio');
}

console.log('\n🔧 Comandos para arreglar:');
console.log('1. npm uninstall mercadopago');
console.log('2. npm install mercadopago@latest');
console.log('3. npm start');

console.log('\n✅ Después de arreglar, ejecuta: node test-api.js');
console.log('='.repeat(60));