const { auth, db } = require('../config/firebase');

class AuthController {
  
  // Verificar token de Firebase
  async verifyToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token requerido' });
      }

      // Verificar token con Firebase
      const decodedToken = await auth.verifyIdToken(token);
      const { uid, email, name, picture } = decodedToken;

      // Buscar o crear usuario en Firestore
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      let userData;
      
      if (!userDoc.exists) {
        // Crear nuevo usuario
        userData = {
          uid,
          email,
          name: name || email.split('@')[0],
          picture: picture || null,
          subscriptionStatus: 'free',
          subscriptionExpiry: null,
          createdAt: new Date(),
          lastLogin: new Date(),
          gameProgress: {},
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'es'
          }
        };
        
        await userRef.set(userData);
        console.log(`✅ Nuevo usuario creado: ${email}`);
      } else {
        // Actualizar último login
        userData = userDoc.data();
        await userRef.update({ lastLogin: new Date() });
      }

      res.json({
        success: true,
        user: userData,
        message: 'Autenticación exitosa'
      });

    } catch (error) {
      console.error('Error en verificación de token:', error);
      res.status(401).json({ 
        error: 'Token inválido',
        message: error.message 
      });
    }
  }

  // Obtener información del usuario
  async getUserInfo(req, res) {
    try {
      const { uid } = req.user; // Del middleware de auth
      
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const userData = userDoc.data();
      
      // No enviar información sensible
      delete userData.subscriptionData;
      
      res.json({
        success: true,
        user: userData
      });

    } catch (error) {
      console.error('Error obteniendo info de usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(req, res) {
    try {
      const { uid } = req.user;
      const { name, preferences } = req.body;

      const updateData = {
        updatedAt: new Date()
      };

      if (name) updateData.name = name;
      if (preferences) updateData.preferences = { ...preferences };

      const userRef = db.collection('users').doc(uid);
      await userRef.update(updateData);

      res.json({
        success: true,
        message: 'Perfil actualizado correctamente'
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ error: 'Error actualizando perfil' });
    }
  }

  // Logout (invalidar token del lado del cliente)
  async logout(req, res) {
    try {
      const { uid } = req.user;
      
      // Actualizar última actividad
      const userRef = db.collection('users').doc(uid);
      await userRef.update({ lastActivity: new Date() });

      res.json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error en logout' });
    }
  }
}

module.exports = new AuthController();