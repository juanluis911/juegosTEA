// 🔧 setup-webhook.js - Configuración automática del webhook MercadoPago
// Ejecutar con: node setup-webhook.js

require('dotenv').config();
const https = require('https');

async function makeRequest(url, method, headers, data = null) {
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

async function setupWebhook() {
  console.log('🔔 Configurando webhook de MercadoPago para JuegoTEA...\n');
  
  // Verificar configuración
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const apiUrl = process.env.API_URL || 'https://api-juegostea.onrender.com';
  const webhookUrl = `${apiUrl}/api/subscription/webhook`;
  
  if (!accessToken) {
    console.log('❌ Error: MERCADOPAGO_ACCESS_TOKEN no está configurado');
    console.log('💡 Configura tu token en el archivo .env');
    return;
  }
  
  const tokenType = accessToken.startsWith('TEST-') ? 'SANDBOX' : 'PRODUCTION';
  console.log(`🏷️  Tipo de token: ${tokenType}`);
  console.log(`🌐 API URL: ${apiUrl}`);
  console.log(`🔔 Webhook URL: ${webhookUrl}\n`);
  
  try {
    // 1. Primero intentar con la API más reciente
    console.log('🔍 Verificando webhooks existentes...');
    
    let listResponse;
    let apiVersion = 'v1';
    
    // Intentar diferentes endpoints de la API
    const apiEndpoints = [
      'https://api.mercadopago.com/v1/webhooks',
      'https://api.mercadopago.com/webhooks',
      'https://api.mercadopago.com/v1/applications/webhooks'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`   🔄 Probando endpoint: ${endpoint}`);
        listResponse = await makeRequest(
          endpoint,
          'GET',
          {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        );
        
        if (listResponse.status === 200) {
          console.log(`   ✅ Endpoint funcional: ${endpoint}`);
          apiVersion = endpoint;
          break;
        } else if (listResponse.status === 404) {
          console.log(`   ❌ Endpoint no encontrado: ${endpoint}`);
          continue;
        } else {
          console.log(`   ⚠️  Endpoint devolvió ${listResponse.status}: ${endpoint}`);
        }
      } catch (error) {
        console.log(`   ❌ Error en endpoint ${endpoint}:`, error.message);
        continue;
      }
    }
    
    if (!listResponse || listResponse.status !== 200) {
      console.log('❌ No se pudo acceder a la API de webhooks');
      console.log('💡 Posibles soluciones:');
      console.log('   1. Verifica que tu token de acceso sea válido');
      console.log('   2. Verifica que tengas permisos para crear webhooks');
      console.log('   3. Configura el webhook manualmente desde el panel web');
      console.log('   4. Revisa la documentación actualizada de MercadoPago');
      return;
    }
    
    const webhooks = listResponse.data.results || listResponse.data || [];
    console.log(`📋 Webhooks encontrados: ${webhooks.length}`);
    
    // Verificar si ya existe un webhook para nuestra URL
    const existingWebhook = webhooks.find(
      webhook => webhook.url === webhookUrl
    );
    
    if (existingWebhook) {
      console.log('✅ Webhook ya existe:', {
        id: existingWebhook.id,
        url: existingWebhook.url,
        events: existingWebhook.events,
        status: existingWebhook.status
      });
      
      if (existingWebhook.status === 'active') {
        console.log('🎯 El webhook ya está activo y configurado correctamente');
        return;
      }
    }
    
    // 2. Crear nuevo webhook usando el endpoint que funcionó
    console.log('🆕 Creando nuevo webhook...');
    
    const webhookData = {
      url: webhookUrl,
      events: ['payment'],
      description: 'JuegoTEA - Webhook para pagos de suscripciones premium'
    };
    
    const createResponse = await makeRequest(
      apiVersion,
      'POST',
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      webhookData
    );
    
    if (createResponse.status === 201 && createResponse.data.id) {
      console.log('✅ Webhook creado exitosamente:');
      console.log('   📝 ID:', createResponse.data.id);
      console.log('   🌐 URL:', createResponse.data.url);
      console.log('   📅 Eventos:', createResponse.data.events);
      console.log('   ⚡ Estado:', createResponse.data.status);
      console.log('   🕒 Creado:', createResponse.data.date_created);
      
      // 3. Probar el webhook
      console.log('\n🧪 Probando conectividad del webhook...');
      await testWebhook(webhookUrl);
      
    } else {
      console.log('❌ Error creando webhook:', createResponse);
    }
    
  } catch (error) {
    console.log('❌ Error configurando webhook:', error.message);
    
    if (error.message.includes('401')) {
      console.log('🔑 Verifica que tu MERCADOPAGO_ACCESS_TOKEN sea válido');
    } else if (error.message.includes('400')) {
      console.log('📝 Verifica que la URL del webhook sea válida y accesible');
    }
  }
}

async function testWebhook(webhookUrl) {
  try {
    // Test de conectividad básica
    const testResponse = await makeRequest(
      webhookUrl + '?topic=test&id=12345',
      'POST',
      {
        'Content-Type': 'application/json',
        'User-Agent': 'MercadoPago-Webhook-Test'
      },
      { test: true }
    );
    
    if (testResponse.status === 200) {
      console.log('✅ Webhook responde correctamente');
      console.log('   📡 Status:', testResponse.status);
      console.log('   📄 Response:', testResponse.data);
    } else {
      console.log('⚠️  Webhook responde pero con código:', testResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Error probando webhook:', error.message);
    console.log('💡 Asegúrate de que tu servidor esté ejecutándose en:', webhookUrl);
  }
}

async function listWebhooks() {
  console.log('📋 Listando todos los webhooks configurados...\n');
  
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('❌ Error: MERCADOPAGO_ACCESS_TOKEN no está configurado');
    return;
  }
  
  try {
    const response = await makeRequest(
      'https://api.mercadopago.com/v1/webhooks',
      'GET',
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    );
    
    if (response.status === 200 && response.data.results) {
      console.log(`🔔 Webhooks encontrados: ${response.data.results.length}\n`);
      
      response.data.results.forEach((webhook, index) => {
        console.log(`${index + 1}. Webhook ID: ${webhook.id}`);
        console.log(`   🌐 URL: ${webhook.url}`);
        console.log(`   📅 Eventos: ${webhook.events.join(', ')}`);
        console.log(`   ⚡ Estado: ${webhook.status}`);
        console.log(`   📝 Descripción: ${webhook.description || 'Sin descripción'}`);
        console.log(`   🕒 Creado: ${webhook.date_created}`);
        console.log('');
      });
    } else {
      console.log('❌ Error obteniendo webhooks:', response);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function deleteWebhook(webhookId) {
  console.log(`🗑️  Eliminando webhook ${webhookId}...`);
  
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('❌ Error: MERCADOPAGO_ACCESS_TOKEN no está configurado');
    return;
  }
  
  try {
    const response = await makeRequest(
      `https://api.mercadopago.com/v1/webhooks/${webhookId}`,
      'DELETE',
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    );
    
    if (response.status === 200) {
      console.log('✅ Webhook eliminado correctamente');
    } else {
      console.log('❌ Error eliminando webhook:', response);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🧩 JuegoTEA - Configuración de Webhook MercadoPago\n');
  
  if (args.length === 0) {
    console.log('📋 Comandos disponibles:');
    console.log('  node setup-webhook.js setup     - Configurar webhook');
    console.log('  node setup-webhook.js list      - Listar webhooks');
    console.log('  node setup-webhook.js delete ID - Eliminar webhook');
    console.log('  node setup-webhook.js test      - Probar webhook\n');
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'setup':
      await setupWebhook();
      break;
      
    case 'list':
      await listWebhooks();
      break;
      
    case 'delete':
      if (args[1]) {
        await deleteWebhook(args[1]);
      } else {
        console.log('❌ Especifica el ID del webhook a eliminar');
      }
      break;
      
    case 'test':
      const webhookUrl = `${process.env.API_URL || 'https://api-juegostea.onrender.com'}/api/subscription/webhook`;
      await testWebhook(webhookUrl);
      break;
      
    default:
      console.log('❌ Comando no reconocido:', command);
      console.log('💡 Usa: node setup-webhook.js sin parámetros para ver la ayuda');
  }
}

// Ejecutar
main().catch(error => {
  console.log('❌ Error general:', error.message);
  process.exit(1);
});