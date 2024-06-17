const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    availableTickets: {
        type: Number,
        required: true,
    },
    header_image: {
        type: String,
        required: true,
    },
    slider_images: {
        type: [String],  // Asegúrate de que esto está definido como un array de strings
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'finished', 'innactive'],
        default: 'innactive',
    },
}, {
    timestamps: true,
});

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;
