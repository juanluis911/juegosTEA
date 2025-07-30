// 🔧 webhook-manual-setup.js - Configuración alternativa del webhook
// Ejecutar con: node webhook-manual-setup.js

require('dotenv').config();
const https = require('https');

async function makeRequest(url, method = 'GET', headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
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

async function checkMercadoPagoAPI() {
  console.log('🔍 VERIFICANDO ACCESO A LA API DE MERCADOPAGO\n');
  
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('❌ Error: MERCADOPAGO_ACCESS_TOKEN no está configurado');
    return false;
  }
  
  const tokenType = accessToken.startsWith('TEST-') ? 'SANDBOX' : 'PRODUCTION';
  console.log(`🏷️  Tipo de token: ${tokenType}`);
  console.log(`🔑 Token: ${accessToken.substring(0, 20)}...`);
  
  // Probar diferentes endpoints para encontrar el correcto
  const endpointsToTest = [
    'https://api.mercadopago.com/users/me',
    'https://api.mercadopago.com/v1/users/me',
    'https://api.mercadopago.com/account/users/me'
  ];
  
  for (const endpoint of endpointsToTest) {
    try {
      console.log(`\n🔄 Probando endpoint: ${endpoint}`);
      
      const response = await makeRequest(
        endpoint,
        'GET',
        {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      );
      
      console.log(`   📡 Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('   ✅ Endpoint funcional');
        console.log(`   👤 Usuario: ${response.data.first_name} ${response.data.last_name}`);
        console.log(`   📧 Email: ${response.data.email}`);
        console.log(`   🆔 ID: ${response.data.id}`);
        console.log(`   🌍 País: ${response.data.country_id}`);
        return true;
      } else if (response.status === 401) {
        console.log('   ❌ Token inválido o sin permisos');
        console.log('   💡 Verifica tu MERCADOPAGO_ACCESS_TOKEN');
        return false;
      } else {
        console.log(`   ⚠️  Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return false;
}

async function testWebhookConnectivity() {
  console.log('\n🔔 PROBANDO CONECTIVIDAD DEL WEBHOOK\n');
  
  const apiUrl = process.env.API_URL || 'https://api-juegostea.onrender.com';
  const webhookUrl = `${apiUrl}/api/subscription/webhook`;
  
  console.log(`🌐 URL del webhook: ${webhookUrl}`);
  
  try {
    // Test básico del webhook
    const response = await makeRequest(
      webhookUrl + '?topic=test&id=12345',
      'POST',
      {
        'Content-Type': 'application/json',
        'User-Agent': 'MercadoPago-Webhook-Test'
      },
      { test: true }
    );
    
    console.log(`📡 Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Webhook responde correctamente');
      console.log(`📄 Response:`, response.data);
      return true;
    } else {
      console.log('❌ Webhook no responde correctamente');
      console.log(`📄 Response:`, response.data);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error conectando al webhook:', error.message);
    console.log('💡 Asegúrate de que tu servidor esté ejecutándose');
    return false;
  }
}

function showManualInstructions() {
  console.log('\n📋 INSTRUCCIONES PARA CONFIGURACIÓN MANUAL\n');
  
  const apiUrl = process.env.API_URL || 'https://api-juegostea.onrender.com';
  const webhookUrl = `${apiUrl}/api/subscription/webhook`;
  
  console.log('🌐 Ve a: https://www.mercadopago.com/developers/panel');
  console.log('🔍 Selecciona tu aplicación');
  console.log('⚙️  Ve a la sección "Webhooks" o "Notificaciones"');
  console.log('➕ Haz clic en "Crear webhook" o "Nueva notificación"');
  console.log('');
  console.log('📝 Configura con estos datos:');
  console.log(`   🌐 URL: ${webhookUrl}`);
  console.log('   📅 Eventos: payment (seleccionar "Pagos")');
  console.log('   🔧 Método: POST');
  console.log('   📄 Nombre: JuegoTEA Webhook');
  console.log('   📝 Descripción: Webhook para pagos de suscripciones premium');
  console.log('');
  console.log('💾 Guarda la configuración y verifica que esté "Activo"');
  console.log('');
}

async function verifyWebhookInPreference() {
  console.log('🧪 VERIFICANDO CONFIGURACIÓN EN PREFERENCIAS DE PAGO\n');
  
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const apiUrl = process.env.API_URL || 'https://api-juegostea.onrender.com';
  
  if (!accessToken) {
    console.log('❌ Token no configurado');
    return;
  }
  
  // Crear una preferencia de prueba para verificar que el webhook se configure
  const testPreference = {
    items: [{
      title: 'Test JuegoTEA',
      unit_price: 100,
      quantity: 1
    }],
    notification_url: `${apiUrl}/api/subscription/webhook`,
    external_reference: `test_${Date.now()}`
  };
  
  try {
    const response = await makeRequest(
      'https://api.mercadopago.com/checkout/preferences',
      'POST',
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      testPreference
    );
    
    if (response.status === 201) {
      console.log('✅ Preferencia de prueba creada exitosamente');
      console.log(`📝 ID: ${response.data.id}`);
      console.log(`🔔 Notification URL configurada: ${response.data.notification_url}`);
      console.log('');
      console.log('🎯 Esto confirma que:');
      console.log('   ✅ Tu token es válido');
      console.log('   ✅ Puedes crear preferencias');
      console.log('   ✅ La URL del webhook se configura correctamente');
      console.log('');
      console.log('💡 El webhook se activará automáticamente cuando alguien pague');
      
      // Mostrar URL de prueba
      if (response.data.sandbox_init_point) {
        console.log(`🧪 URL de prueba: ${response.data.sandbox_init_point}`);
        console.log('   (Puedes usar esta URL para probar el flujo completo)');
      }
      
      return true;
    } else {
      console.log('❌ Error creando preferencia de prueba');
      console.log(`📡 Status: ${response.status}`);
      console.log(`📄 Response:`, response.data);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🧩 JuegoTEA - Configuración Alternativa de Webhook\n');
  
  if (args.includes('--help')) {
    console.log('Comandos disponibles:');
    console.log('  node webhook-manual-setup.js                    - Verificación completa');
    console.log('  node webhook-manual-setup.js --check-api        - Solo verificar API');
    console.log('  node webhook-manual-setup.js --test-webhook     - Solo probar webhook');
    console.log('  node webhook-manual-setup.js --create-test      - Crear preferencia de prueba');
    console.log('  node webhook-manual-setup.js --instructions     - Mostrar instrucciones manuales');
    return;
  }
  
  if (args.includes('--check-api')) {
    await checkMercadoPagoAPI();
    return;
  }
  
  if (args.includes('--test-webhook')) {
    await testWebhookConnectivity();
    return;
  }
  
  if (args.includes('--create-test')) {
    await verifyWebhookInPreference();
    return;
  }
  
  if (args.includes('--instructions')) {
    showManualInstructions();
    return;
  }
  
  // Verificación completa por defecto
  console.log('🔍 EJECUTANDO VERIFICACIÓN COMPLETA\n');
  
  // Paso 1: Verificar API
  const apiWorking = await checkMercadoPagoAPI();
  
  if (!apiWorking) {
    console.log('\n❌ La API de MercadoPago no está funcionando');
    console.log('💡 Revisa tu token de acceso y vuelve a intentar');
    return;
  }
  
  // Paso 2: Probar webhook
  const webhookWorking = await testWebhookConnectivity();
  
  if (!webhookWorking) {
    console.log('\n⚠️  El webhook no responde correctamente');
    console.log('💡 Asegúrate de que tu servidor esté ejecutándose');
  }
  
  // Paso 3: Crear preferencia de prueba
  const preferenceWorking = await verifyWebhookInPreference();
  
  // Paso 4: Mostrar instrucciones manuales
  showManualInstructions();
  
  // Resumen final
  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(60));
  console.log(`🔑 API de MercadoPago: ${apiWorking ? '✅ Funcionando' : '❌ Error'}`);
  console.log(`🔔 Webhook: ${webhookWorking ? '✅ Funcionando' : '❌ Error'}`);
  console.log(`🧪 Preferencias: ${preferenceWorking ? '✅ Funcionando' : '❌ Error'}`);
  console.log('');
  
  if (apiWorking && webhookWorking && preferenceWorking) {
    console.log('🎉 ¡Todo está configurado correctamente!');
    console.log('💡 Ahora configura el webhook manualmente siguiendo las instrucciones de arriba');
  } else {
    console.log('⚠️  Hay algunos problemas que necesitas resolver:');
    if (!apiWorking) console.log('   - Revisa tu token de MercadoPago');
    if (!webhookWorking) console.log('   - Verifica que tu servidor esté funcionando');
    if (!preferenceWorking) console.log('   - Revisa los permisos de tu aplicación en MercadoPago');
  }
  
  console.log('');
  console.log('📞 Si necesitas ayuda:');
  console.log('   📖 Documentación: https://www.mercadopago.com/developers/');
  console.log('   🌐 Panel: https://www.mercadopago.com/developers/panel');
  console.log('');
}

main().catch(error => {
  console.log('❌ Error general:', error.message);
  process.exit(1);
});