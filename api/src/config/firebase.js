const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
    }
    
    console.log('✅ Firebase Admin SDK inicializado');
    return admin;
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
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