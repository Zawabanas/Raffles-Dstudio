// server/config/database.js

const mongoose = require('mongoose');

const dbURI = 'mongodb://localhost:27017/raffles'; // Cambia esto por tu propia URL de MongoDB

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión a la base de datos establecida');
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    process.exit(1);
  }
};

module.exports = connectDB;

