const Raffle = require('../models/raffle');

async function validateRaffleData(raffleData) {
    console.log('Validando datos de la rifa:', raffleData);

    // Verificar si el título de la rifa ya existe
    const existingRaffleTitle = await Raffle.findOne({ title: raffleData.title });
    if (existingRaffleTitle) {
        throw new Error('Ya existe una rifa con este título');
    }

    // Verificar si la fecha de inicio es anterior a la fecha de finalización
    if (raffleData.startDate >= raffleData.endDate) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de finalización');
    }

    // Agregar más validaciones si es necesario
    console.log('Datos de la rifa validados correctamente');
}

module.exports = {
    validateRaffleData,
};
