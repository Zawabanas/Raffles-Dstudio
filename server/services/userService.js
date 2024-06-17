const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

async function validateUserData(userData) {
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone || !userData.password) {
        throw new Error('Todos los campos son obligatorios');
    }

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser && existingUser._id.toString() !== userData._id) {
        throw new Error('El correo electrónico ya está en uso');
    }
}

async function registerUser(userData) {
    await validateUserData(userData);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({ ...userData, password: hashedPassword });
    await user.save();
    return user;
}

async function loginUser(email, password) {
    const user = await User.findOne({ email });

    if (!user || !user.active) {
        throw new Error('Email o contraseña incorrectos');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Email o contraseña incorrectos');
    }

    const token = generateToken(user._id);
    return { user, token };
}

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

async function sendPasswordResetEmail(email) {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('No se encontró un usuario con ese correo electrónico');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Recuperación de contraseña',
        html: `
      <h1>Recuperación de Contraseña</h1>
      <p>Hola,</p>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="http://localhost:3000/reset-password?token=${token}">Restablecer Contraseña</a>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `
    };

    await transporter.sendMail(mailOptions);
}

async function resetPassword(token, newPassword) {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('El token de restablecimiento de contraseña es inválido o ha expirado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save({ validateBeforeSave: false });
}

async function getUserById(id) {
    return await User.findById(id);
}

async function getAllUsers() {
    return await User.find();
}

async function updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    Object.assign(user, updateData);

    if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updateData.password, salt);
    }

    await user.save();
    return user;
}

async function deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    user.isActive = false;
    await user.save();
}

async function verifyPassword(userId, password) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    return await bcrypt.compare(password, user.password);
    return isMatch;
}

async function toggleUserStatus(id) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    user.active = !user.active;
    await user.save();
    return user;
}

module.exports = {
    registerUser,
    loginUser,
    sendPasswordResetEmail,
    resetPassword,
    generateToken,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    verifyPassword,
    toggleUserStatus,

};
