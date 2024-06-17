const express = require('express');
const router = express.Router();
const raffleController = require('../controllers/raffleController');
const { protect, admin } = require('../middleware/authMiddleware');

// Ruta para obtener la rifa activa
router.get('/active', raffleController.getActiveRaffle);

// Ruta para obtener todas las rifas
router.get('/', raffleController.getAllRaffles);

// Ruta para obtener una rifa por su ID
router.get('/:id', raffleController.getRaffleById);

// Ruta para crear una nueva rifa
router.post('/create', raffleController.createRaffle);

// Ruta para actualizar una rifa existente por su ID
router.put('/:id', raffleController.updateRaffle);

// Ruta para eliminar una rifa existente por su ID
router.delete('/:id', protect, admin, raffleController.deleteRaffle);

router.patch('/:id/status', raffleController.updateRaffleStatus); // Nueva ruta para actualizar el estado


module.exports = router;

