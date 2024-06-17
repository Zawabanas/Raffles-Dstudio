const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { protect, admin } = require('../middleware/authMiddleware');


// Rutas para operaciones CRUD de participantes
router.get('/', participantController.getAllParticipants);
router.get('/:id', participantController.getParticipantById);
router.post('/create', participantController.createParticipant);
router.put('/:id', participantController.updateParticipant);
router.delete('/:id', protect, admin, participantController.deleteParticipant);

// Ruta para seleccionar un ganador de una rifa específica
router.get('/raffle/:raffleId/winner', participantController.chooseWinner);

module.exports = router;
