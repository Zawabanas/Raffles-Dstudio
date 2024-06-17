// server/controllers/participantController.js

const Participant = require('../models/participant');
const Ticket = require('../models/ticket');
const participantService = require('../services/participantService');

// Obtener todos los participantes
async function getAllParticipants(req, res) {
  try {
    const participants = await Participant.find().populate('tickets raffle');
    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener un participante por su ID
async function getParticipantById(req, res) {
  const { id } = req.params;
  try {
    const participant = await Participant.findById(id).populate('tickets raffle');
    if (!participant) {
      return res.status(404).json({ message: 'Participante no encontrado' });
    }
    res.status(200).json(participant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Crear un nuevo participante
async function createParticipant(req, res) {
  const participantData = req.body;

  try {
    // Validar los datos del participante
    await participantService.validateParticipantData(participantData);

    // Crear boletos y asignarlos al participante
    const tickets = await Promise.all(participantData.tickets.map(async (ticketNumber) => {
      const ticket = new Ticket({
        number: ticketNumber,
        participant: null,  // Se asignará más adelante
        raffle: participantData.raffle,
        status: 'sold',
      });
      await ticket.save();
      return ticket;
    }));

    // Crear el participante
    const newParticipant = new Participant({
      ...participantData,
      tickets: tickets.map(ticket => ticket._id),
    });

    // Asignar los boletos al participante
    await newParticipant.save();
    await Ticket.updateMany({ _id: { $in: newParticipant.tickets } }, { participant: newParticipant._id });

    res.status(201).json(newParticipant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Actualizar un participante existente por su ID
async function updateParticipant(req, res) {
  const { id } = req.params;
  const newData = req.body;

  try {
    const existingParticipant = await Participant.findById(id).populate('tickets raffle');
    if (!existingParticipant) {
      return res.status(404).json({ message: 'Participante no encontrado' });
    }

    // Validar los nuevos datos del participante
    await participantService.validateParticipantData(newData);

    // Liberar y eliminar los boletos anteriores
    await Ticket.deleteMany({ _id: { $in: existingParticipant.tickets } });

    // Crear nuevos boletos y asignarlos al participante
    const tickets = await Promise.all(newData.tickets.map(async (ticketNumber) => {
      const ticket = new Ticket({
        number: ticketNumber,
        participant: existingParticipant._id,
        raffle: newData.raffle,
        status: 'sold',
      });
      await ticket.save();
      return ticket;
    }));

    // Actualizar el participante
    existingParticipant.firstName = newData.firstName;
    existingParticipant.lastName = newData.lastName;
    existingParticipant.phoneNumber = newData.phoneNumber;
    existingParticipant.state = newData.state;
    existingParticipant.tickets = tickets.map(ticket => ticket._id);
    existingParticipant.raffle = newData.raffle;

    await existingParticipant.save();
    res.status(200).json(existingParticipant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Eliminar un participante existente por su ID
async function deleteParticipant(req, res) {
  const { id } = req.params;

  try {
    const deletedParticipant = await Participant.findByIdAndDelete(id);
    if (!deletedParticipant) {
      return res.status(404).json({ message: 'Participante no encontrado' });
    }

    // Liberar los boletos asociados al participante
    await Ticket.updateMany({ participant: deletedParticipant._id }, { status: 'available', participant: null });

    res.status(200).json({ message: 'Participante eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Elegir un ganador para una rifa
async function chooseWinner(req, res) {
  const { raffleId } = req.params;

  try {
    const participants = await Participant.find({ raffle: raffleId }).populate('tickets');
    if (participants.length === 0) {
      return res.status(404).json({ message: 'No hay participantes en esta rifa' });
    }

    const { winner, winningTicket } = participantService.selectRandomWinner(participants);
    res.status(200).json({ winner, winningTicket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllParticipants,
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  chooseWinner,
};
