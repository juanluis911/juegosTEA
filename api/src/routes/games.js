const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { verifyAuth, optionalAuth } = require('../middleware/auth');

// GET /games/:gameId/access - Verificar acceso a juego específico
router.get('/:gameId/access', optionalAuth, gameController.checkGameAccess);

// POST /games/:gameId/progress - Guardar progreso del juego
router.post('/:gameId/progress', verifyAuth, gameController.saveGameProgress);

// GET /games/:gameId/progress - Obtener progreso del juego
router.get('/:gameId/progress', verifyAuth, gameController.getGameProgress);

// GET /games/list - Obtener lista de juegos disponibles
router.get('/list', optionalAuth, gameController.getGamesList);

module.exports = router;