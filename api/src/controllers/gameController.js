const { db } = require('../config/firebase');

class GameController {
  
  constructor() {
    // Definir juegos gratuitos vs premium
    this.gameConfig = {
      // Juegos gratuitos (siempre disponibles)
      free: [
        'lectura-palabras',
        'colores-basicos',
        'animales-sonidos'
      ],
      // Juegos premium (requieren suscripción)
      premium: [
        'aventura-letras',
        'constructor-palabras',
        'hora-cuento',
        'reconoce-emociones',
        'situaciones-sociales',
        'puzzles-logicos',
        'memoria-secuencial',
        'patron-ritmos',
        'coordinacion-motora',
        'respiracion-relajacion',
        'identificar-sentimientos',
        'expresion-emocional',
        'integgracion-sensorial'
      ]
    };
  }

  // Verificar acceso a un juego específico
  async checkGameAccess(req, res) {
    try {
      const { gameId } = req.params;
      const user = req.user; // Puede ser null si no está autenticado

      // Verificar si el juego existe
      const allGames = [...this.gameConfig.free, ...this.gameConfig.premium];
      if (!allGames.includes(gameId)) {
        return res.status(404).json({ 
          error: 'Juego no encontrado',
          gameId 
        });
      }

      // Si es juego gratuito, siempre permitir acceso
      if (this.gameConfig.free.includes(gameId)) {
        return res.json({
          success: true,
          hasAccess: true,
          gameType: 'free',
          message: 'Acceso permitido - Juego gratuito'
        });
      }

      // Para juegos premium, verificar autenticación y suscripción
      if (!user) {
        return res.json({
          success: true,
          hasAccess: false,
          gameType: 'premium',
          reason: 'authentication_required',
          message: 'Inicia sesión para acceder a juegos premium'
        });
      }

      // Verificar estado de suscripción
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.json({
          success: true,
          hasAccess: false,
          gameType: 'premium',
          reason: 'user_not_found',
          message: 'Usuario no encontrado'
        });
      }

      const userData = userDoc.data();
      const now = new Date();
      const expiry = userData.subscriptionExpiry?.toDate();

      // Verificar si tiene suscripción activa
      const hasActiveSubscription = 
        userData.subscriptionStatus === 'active' && 
        expiry && 
        expiry > now;

      if (!hasActiveSubscription) {
        return res.json({
          success: true,
          hasAccess: false,
          gameType: 'premium',
          reason: 'subscription_required',
          message: 'Suscripción premium requerida',
          subscription: {
            status: userData.subscriptionStatus || 'free',
            expiry: expiry
          }
        });
      }

      // Acceso permitido
      res.json({
        success: true,
        hasAccess: true,
        gameType: 'premium',
        message: 'Acceso permitido - Suscripción activa',
        subscription: {
          status: userData.subscriptionStatus,
          expiry: expiry,
          daysRemaining: Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        }
      });

    } catch (error) {
      console.error('Error verificando acceso al juego:', error);
      res.status(500).json({ 
        error: 'Error verificando acceso al juego',
        message: error.message 
      });
    }
  }

  // Obtener lista de juegos con información de acceso
  async getGamesList(req, res) {
    try {
      const user = req.user;

      // Información básica de todos los juegos
      const gamesInfo = {
        'lectura-palabras': {
          name: 'Lectura de Palabras',
          category: 'comunicacion',
          description: 'Aprende a leer palabras básicas',
          type: 'free'
        },
        'colores-basicos': {
          name: 'Colores Básicos',
          category: 'comunicacion',
          description: 'Identifica y aprende colores',
          type: 'free'
        },
        'animales-sonidos': {
          name: 'Animales y Sonidos',
          category: 'comunicacion',
          description: 'Relaciona animales con sus sonidos',
          type: 'free'
        },
        'reconoce-emociones': {
          name: 'Reconoce Emociones',
          category: 'social',
          description: 'Identifica diferentes emociones faciales',
          type: 'premium'
        },
        'situaciones-sociales': {
          name: 'Situaciones Sociales',
          category: 'social',
          description: 'Practica habilidades sociales',
          type: 'premium'
        }
        // Agregar más juegos según necesites...
      };

      let userSubscriptionStatus = null;
      
      if (user) {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const now = new Date();
          const expiry = userData.subscriptionExpiry?.toDate();
          
          userSubscriptionStatus = {
            status: userData.subscriptionStatus || 'free',
            isActive: userData.subscriptionStatus === 'active' && expiry && expiry > now,
            expiry: expiry
          };
        }
      }

      // Determinar acceso para cada juego
      const gamesWithAccess = Object.entries(gamesInfo).map(([gameId, info]) => ({
        id: gameId,
        ...info,
        hasAccess: info.type === 'free' || (userSubscriptionStatus?.isActive === true)
      }));

      res.json({
        success: true,
        games: gamesWithAccess,
        user: {
          isAuthenticated: !!user,
          subscription: userSubscriptionStatus
        }
      });

    } catch (error) {
      console.error('Error obteniendo lista de juegos:', error);
      res.status(500).json({ 
        error: 'Error obteniendo lista de juegos',
        message: error.message 
      });
    }
  }

  // Guardar progreso del juego
  async saveGameProgress(req, res) {
    try {
      const { gameId } = req.params;
      const { uid } = req.user;
      const progressData = req.body;

      // Validar datos básicos
      if (!progressData.score && !progressData.level && !progressData.completedAt) {
        return res.status(400).json({ 
          error: 'Datos de progreso inválidos' 
        });
      }

      const userRef = db.collection('users').doc(uid);
      
      // Estructura del progreso
      const gameProgress = {
        [`gameProgress.${gameId}`]: {
          lastPlayed: new Date(),
          bestScore: progressData.score || 0,
          currentLevel: progressData.level || 1,
          totalPlayTime: progressData.playTime || 0,
          completedLevels: progressData.completedLevels || [],
          achievements: progressData.achievements || [],
          ...progressData
        }
      };

      await userRef.update(gameProgress);

      res.json({
        success: true,
        message: 'Progreso guardado correctamente'
      });

    } catch (error) {
      console.error('Error guardando progreso:', error);
      res.status(500).json({ 
        error: 'Error guardando progreso',
        message: error.message 
      });
    }
  }

  // Obtener progreso del juego
  async getGameProgress(req, res) {
    try {
      const { gameId } = req.params;
      const { uid } = req.user;

      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const userData = userDoc.data();
      const gameProgress = userData.gameProgress?.[gameId] || {
        lastPlayed: null,
        bestScore: 0,
        currentLevel: 1,
        totalPlayTime: 0,
        completedLevels: [],
        achievements: []
      };

      res.json({
        success: true,
        progress: gameProgress
      });

    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      res.status(500).json({ 
        error: 'Error obteniendo progreso',
        message: error.message 
      });
    }
  }
}

module.exports = new GameController();