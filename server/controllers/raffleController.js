const Raffle = require('../models/raffle');
const mongoose = require('mongoose');

// Obtener todas las rifas
async function getAllRaffles(req, res) {
  try {
    const raffles = await Raffle.find();
    res.status(200).json(raffles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener una rifa por su ID
async function getRaffleById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return res.status(404).json({ message: 'Rifa no encontrada' });
    }
    res.status(200).json(raffle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Crear una nueva rifa
async function createRaffle(req, res) {
  const raffleData = req.body;

  try {
    const newRaffle = new Raffle(raffleData);
    await newRaffle.save();
    res.status(201).json(newRaffle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Actualizar una rifa existente por su ID
async function updateRaffle(req, res) {
  const { id } = req.params;
  const newData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const updatedRaffle = await Raffle.findByIdAndUpdate(id, newData, { new: true });
    if (!updatedRaffle) {
      return res.status(404).json({ message: 'Rifa no encontrada' });
    }
    res.status(200).json(updatedRaffle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Eliminar una rifa existente por su ID
async function deleteRaffle(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const deletedRaffle = await Raffle.findByIdAndDelete(id);
    if (!deletedRaffle) {
      return res.status(404).json({ message: 'Rifa no encontrada' });
    }
    res.status(200).json({ message: 'Rifa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// Método para obtener la imagen del encabezado de una rifa específica
async function getRaffleHeaderImage(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return res.status(404).json({ message: 'Rifa no encontrada' });
    }
    res.status(200).json({ headerImage: raffle.header_image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener la rifa activa
async function getActiveRaffle(req, res) {
  try {
    const raffle = await Raffle.findOne({ status: 'active' });
    if (!raffle) {
      return res.status(404).json({ message: 'No hay rifas activas' });
    }
    res.status(200).json(raffle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateRaffleStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const updatedRaffle = await Raffle.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedRaffle) {
      return res.status(404).json({ message: 'Rifa no encontrada' });
    }
    res.status(200).json(updatedRaffle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}






module.exports = {
  getAllRaffles,
  getRaffleById,
  getActiveRaffle,
  createRaffle,
  updateRaffle,
  deleteRaffle,
  updateRaffleStatus

};
