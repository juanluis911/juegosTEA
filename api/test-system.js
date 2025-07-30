// 🧪 test-system.js - Script para probar todo el sistema de webhooks
// Ejecutar con: node test-system.js

require('dotenv').config();
const https = require('https');

// Configuración
const API_BASE = process.env.API_URL || 'https://api-juegostea.onrender.com';
const TEST_EMAIL = 'test@juegotea.com';
const TEST_NAME = 'Usuario de Prueba';

// Función para hacer requests HTTP
async function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: parsedData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data: responseData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Función para mostrar resultados
function logTest(testName, success, details = null) {
  const emoji = success ? '✅' : '❌';
  console.log(`${emoji} ${testName}`);
  if (details) {
    if (typeof details === 'object') {
      console.log(`   📊 ${JSON.stringify(details, null, 2)}`);
    } else {
      console.log(`   📝 ${details}`);
    }
  }
  console.log('');
}

// Tests del sistema
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA JUEGOTEA\n');
  console.log(`🌐 API Base URL: ${API_BASE}\n`);
  
  let passedTests = 0;
  let totalTests = 0;

  try {
    // Test 1: Health Check
    totalTests++;
    console.log('1️⃣ PROBANDO HEALTH CHECK...');
    const healthResponse = await makeRequest(`${API_BASE}/health`);
    const healthPassed = healthResponse.success && healthResponse.data.status === 'healthy';
    logTest('Health Check', healthPassed, {
      status: healthResponse.status,
      healthy: healthResponse.data.status,
      mercadopago: healthResponse.data.services?.mercadopago,
      database: healthResponse.data.database
    });
    if (healthPassed) passedTests++;

    // Test 2: Obtener Planes
    totalTests++;
    console.log('2️⃣ PROBANDO OBTENER PLANES...');
    const plansResponse = await makeRequest(`${API_BASE}/api/subscription/plans`);
    const plansPassed = plansResponse.success && plansResponse.data.plans;
    logTest('Obtener Planes', plansPassed, {
      status: plansResponse.status,
      plans_count: Object.keys(plansResponse.data.plans || {}).length,
      available_plans: Object.keys(plansResponse.data.plans || {})
    });
    if (plansPassed) passedTests++;

    // Test 3: Crear Suscripción
    totalTests++;
    console.log('3️⃣ PROBANDO CREAR SUSCRIPCIÓN...');
    const createData = {
      plan: 'premium',
      userEmail: TEST_EMAIL,
      userName: TEST_NAME
    };
    const createResponse = await makeRequest(
      `${API_BASE}/api/subscription/create`, 
      'POST', 
      createData
    );
    const createPassed = createResponse.success && createResponse.data.preference_id;
    logTest('Crear Suscripción', createPassed, {
      status: createResponse.status,
      has_preference: !!createResponse.data.preference_id,
      has_init_point: !!createResponse.data.init_point,
      external_reference: createResponse.data.external_reference
    });
    if (createPassed) passedTests++;

    // Test 4: Consultar Estado de Suscripción (debería ser false inicialmente)
    totalTests++;
    console.log('4️⃣ PROBANDO CONSULTAR ESTADO DE SUSCRIPCIÓN...');
    const statusResponse = await makeRequest(`${API_BASE}/api/subscription/status?email=${TEST_EMAIL}`);
    const statusPassed = statusResponse.success;
    logTest('Consultar Estado', statusPassed, {
      status: statusResponse.status,
      has_subscription: statusResponse.data.has_subscription,
      subscription_status: statusResponse.data.status
    });
    if (statusPassed) passedTests++;

    // Test 5: Validar Suscripción
    totalTests++;
    console.log('5️⃣ PROBANDO VALIDAR SUSCRIPCIÓN...');
    const validateData = { email: TEST_EMAIL };
    const validateResponse = await makeRequest(
      `${API_BASE}/api/subscription/validate`, 
      'POST', 
      validateData
    );
    const validatePassed = validateResponse.success;
    logTest('Validar Suscripción', validatePassed, {
      status: validateResponse.status,
      is_active: validateResponse.data.is_active,
      has_subscription: validateResponse.data.has_subscription
    });
    if (validatePassed) passedTests++;

    // Test 6: Historial de Pagos
    totalTests++;
    console.log('6️⃣ PROBANDO HISTORIAL DE PAGOS...');
    const historyResponse = await makeRequest(`${API_BASE}/api/subscription/history?email=${TEST_EMAIL}`);
    const historyPassed = historyResponse.success;
    logTest('Historial de Pagos', historyPassed, {
      status: historyResponse.status,
      payments_count: historyResponse.data.payment_history?.length || 0,
      has_current_subscription: !!historyResponse.data.current_subscription
    });
    if (historyPassed) passedTests++;

    // Test 7: Probar Webhook (simulado)
    totalTests++;
    console.log('7️⃣ PROBANDO WEBHOOK (SIMULADO)...');
    const webhookResponse = await makeRequest(
      `${API_BASE}/api/subscription/webhook?topic=payment&id=123456789`, 
      'POST',
      { test: true }
    );
    const webhookPassed = webhookResponse.success && webhookResponse.data.received;
    logTest('Webhook Simulado', webhookPassed, {
      status: webhookResponse.status,
      received: webhookResponse.data.received,
      processed: webhookResponse.data.processed
    });
    if (webhookPassed) passedTests++;

    // Test 8: Endpoints de Admin (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      totalTests++;
      console.log('8️⃣ PROBANDO ENDPOINTS DE ADMIN...');
      const adminResponse = await makeRequest(`${API_BASE}/api/admin/stats`);
      const adminPassed = adminResponse.success;
      logTest('Endpoints de Admin', adminPassed, {
        status: adminResponse.status,
        total_payments: adminResponse.data.payments?.total,
        active_subscriptions: adminResponse.data.subscriptions?.active
      });
      if (adminPassed) passedTests++;
    }

    // Test 9: CORS y Headers
    totalTests++;
    console.log('9️⃣ PROBANDO CONFIGURACIÓN...');
    const configResponse = await makeRequest(`${API_BASE}/`);
    const configPassed = configResponse.success && configResponse.data.name === 'JuegoTEA API';
    logTest('Configuración de API', configPassed, {
      status: configResponse.status,
      api_name: configResponse.data.name,
      version: configResponse.data.version,
      webhook_configured: configResponse.data.webhook_configured
    });
    if (configPassed) passedTests++;

  } catch (error) {
    console.log('❌ ERROR GENERAL EN LAS PRUEBAS:', error.message);
  }

  // Resumen final
  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje de éxito: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está funcionando correctamente.');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa la configuración del sistema.');
  }
  console.log('');

  // Recomendaciones
  console.log('💡 PRÓXIMOS PASOS:');
  if (passedTests < totalTests) {
    console.log('1. Revisa los logs del servidor para errores específicos');
    console.log('2. Verifica que las variables de entorno estén configuradas');
    console.log('3. Comprueba que MercadoPago esté configurado correctamente');
  } else {
    console.log('1. El sistema está listo para recibir pagos reales');
    console.log('2. Configura el webhook en el panel de MercadoPago');
    console.log('3. Realiza una prueba de pago completa con tarjeta de prueba');
  }
  console.log('4. Monitorea los logs después del deployment');
  console.log('');
}

// Función para probar un pago completo (requiere intervención manual)
async function testCompletePayment() {
  console.log('💳 PRUEBA DE PAGO COMPLETO\n');
  console.log('Esta prueba requiere intervención manual:\n');
  
  try {
    // Crear suscripción
    const createData = {
      plan: 'premium',
      userEmail: TEST_EMAIL,
      userName: TEST_NAME
    };
    
    const createResponse = await makeRequest(
      `${API_BASE}/api/subscription/create`, 
      'POST', 
      createData
    );
    
    if (createResponse.success) {
      console.log('✅ Suscripción creada exitosamente');
      console.log(`🔗 URL de pago: ${createResponse.data.init_point}`);
      console.log(`🔗 URL de prueba: ${createResponse.data.sandbox_init_point}`);
      console.log(`📝 Referencia: ${createResponse.data.external_reference}`);
      console.log('');
      console.log('🧪 Para completar la prueba:');
      console.log('1. Abre la URL de pago en tu navegador');
      console.log('2. Usa una tarjeta de prueba de MercadoPago');
      console.log('3. Completa el pago');
      console.log('4. Verifica que el webhook reciba la notificación');
      console.log('5. Consulta el estado de la suscripción');
      console.log('');
      console.log('📱 Datos de tarjeta de prueba:');
      console.log('   Número: 4509 9535 6623 3704');
      console.log('   CVV: 123');
      console.log('   Vencimiento: 11/25');
      console.log('   Titular: Cualquier nombre');
    } else {
      console.log('❌ Error creando suscripción:', createResponse.data);
    }
  } catch (error) {
    console.log('❌ Error en prueba de pago:', error.message);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--payment-test')) {
    await testCompletePayment();
  } else {
    await runTests();
  }
  
  if (args.includes('--help')) {
    console.log('🧪 JuegoTEA - Script de Pruebas del Sistema\n');
    console.log('Uso:');
    console.log('  node test-system.js              - Ejecutar todas las pruebas');
    console.log('  node test-system.js --payment-test - Crear pago de prueba');
    console.log('  node test-system.js --help        - Mostrar esta ayuda');
    console.log('');
  }
}

// Ejecutar
main().catch(error => {
  console.log('❌ Error ejecutando pruebas:', error.message);
  process.exit(1);
});