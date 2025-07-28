const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Verificar que todas las variables necesarias estén presentes
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL', 
      'FIREBASE_PRIVATE_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`);
    }

    // Verificar que project_id no esté vacío
    if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID.trim() === '') {
      throw new Error('❌ FIREBASE_PROJECT_ID está vacío o no definido');
    }

    console.log('🔍 Verificando credenciales Firebase...');
    console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('   Private Key:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Presente' : '❌ Faltante');

    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };

      console.log('🔧 Inicializando Firebase con:', {
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKeyLength: serviceAccount.privateKey?.length || 0
      });

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
      });
    }
    
    console.log('✅ Firebase Admin SDK inicializado correctamente');
    return admin;
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error.message);
    console.error('📋 Variables de entorno actuales:');
    console.error('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '(no definido)');
    console.error('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || '(no definido)');
    console.error('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Definido' : '(no definido)');
    throw error;
  }
};

const firebase = initializeFirebase();
const db = firebase.firestore();
const auth = firebase.auth();

module.exports = {
  firebase,
  db,
  auth
};