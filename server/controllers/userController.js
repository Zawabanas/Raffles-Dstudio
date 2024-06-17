const mongoose = require('mongoose');
const User = require('../models/user');
const userService = require('../services/userService');

// Registro de un nuevo usuario
async function registerUser(req, res) {
  try {
    const user = await userService.registerUser(req.body);
    const token = userService.generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Inicio de sesión de un usuario
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const { user, token } = await userService.loginUser(email, password);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

// Obtener todos los usuarios
async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener un usuario por ID
async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

// Actualizar un usuario por ID
async function updateUser(req, res) {
  const { id } = req.params;
  try {
    const updatedUser = await userService.updateUser(id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

// Eliminar un usuario por ID
async function deleteUser(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await user.remove();
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Recuperación de contraseña
async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    await userService.sendPasswordResetEmail(email);
    res.status(200).json({ message: 'Correo enviado' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Restablecimiento de contraseña
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  try {
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Contraseña restablecida' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Desactivar un usuario por ID
async function toggleUserStatus(req, res) {
  const { id } = req.params;
  try {
    const updatedUser = await userService.toggleUserStatus(id);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  forgotPassword,
  resetPassword,
};
