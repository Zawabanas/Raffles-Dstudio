require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const raffleRoutes = require('./routes/raffleRoutes');
const participantRoutes = require('./routes/participantRoutes');
const http = require('http');
const socketIO = require('socket.io');

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/participants', participantRoutes);

// Ruta para la página de usuarios
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'user', 'index.html'));
});

// Ruta para la página de métodos de pago
app.get('/pay-methods', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'user', 'pay-methods.html'));
});

// Ruta para la página de compra de boletos
app.get('/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'user', 'tickets.html'));
});

// Ruta para la página de administración
app.get('/login-page', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'login-admin.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'reset-password.html'));
});

app.get('/admin-page', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'admin-page.html'));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });

  socket.on('customEvent', (data) => {
    console.log('Evento personalizado recibido:', data);
    socket.emit('responseEvent', { message: 'Respuesta del servidor' });
  });
});

module.exports = io;
