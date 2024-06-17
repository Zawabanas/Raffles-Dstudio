const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    default: null,
  },
  raffle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Raffle',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
  },
}, {
  timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
