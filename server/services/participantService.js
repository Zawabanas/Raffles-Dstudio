const Participant = require('../models/participant');
const Ticket = require('../models/ticket');
const Raffle = require('../models/raffle');

async function validateParticipantData(participantData, participantId = null) {
  console.log('Validando datos del participante:', participantData);

  // Verificar si la rifa existe y está activa
  const raffle = await Raffle.findById(participantData.raffle);
  if (!raffle) {
    throw new Error('La rifa no existe');
  }
  if (raffle.status !== 'active') {
    throw new Error('La rifa no está activa');
  }

  // Verificar si los boletos ya están comprados por otros participantes
  const query = { number: { $in: participantData.tickets }, raffle: participantData.raffle, status: 'sold' };
  if (participantId) {
    // Excluir los boletos del participante actual si se trata de una actualización
    const currentParticipant = await Participant.findById(participantId);
    query.number.$nin = currentParticipant.tickets.map(ticket => ticket.number);
  }

  const existingTickets = await Ticket.find(query);

  if (existingTickets.length > 0) {
    const ticketNumbers = existingTickets.map(ticket => ticket.number).join(', ');
    throw new Error(`Los boletos ${ticketNumbers} ya están comprados`);
  }
}

module.exports = {
  validateParticipantData,
};
