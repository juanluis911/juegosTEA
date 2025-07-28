const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAuth } = require('../middleware/auth');

// POST /api/auth/verify - Verificar token de Firebase
router.post('/verify', authController.verifyToken);

// GET /api/auth/user - Obtener información del usuario autenticado
router.get('/user', verifyAuth, authController.getUserInfo);

// PUT /api/auth/profile - Actualizar perfil de usuario
router.put('/profile', verifyAuth, authController.updateProfile);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', verifyAuth, authController.logout);

module.exports = router;