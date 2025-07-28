const { auth } = require('../config/firebase');

// Middleware para verificar autenticación
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorización requerido',
        code: 'AUTH_TOKEN_MISSING'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token con Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Agregar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };

    next();

  } catch (error) {
    console.error('Error en verificación de auth:', error);
    
    let errorMessage = 'Token inválido';
    let errorCode = 'AUTH_TOKEN_INVALID';

    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expirado';
      errorCode = 'AUTH_TOKEN_EXPIRED';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Formato de token inválido';
      errorCode = 'AUTH_TOKEN_FORMAT_INVALID';
    }

    res.status(401).json({ 
      error: errorMessage,
      code: errorCode
    });
  }
};

// Middleware opcional - no falla si no hay token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decodedToken = await auth.verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      };
    }
    
    next();

  } catch (error) {
    // En modo opcional, continuamos sin usuario autenticado
    console.warn('Token opcional inválido:', error.message);
    next();
  }
};

module.exports = {
  verifyAuth,
  optionalAuth
};