// server/models/participant.js

const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
  },
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  }],
  raffle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Raffle',
    required: true,
  },
}, {
  timestamps: true,
});

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
