const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAuth } = require('../middleware/auth');

// POST /auth/verify - Verificar token de Firebase
router.post('/verify', authController.verifyToken);

// GET /auth/user - Obtener información del usuario autenticado
router.get('/user', verifyAuth, authController.getUserInfo);

// PUT /auth/profile - Actualizar perfil de usuario
router.put('/profile', verifyAuth, authController.updateProfile);

// POST /auth/logout - Cerrar sesión
router.post('/logout', verifyAuth, authController.logout);

module.exports = router;