const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'No autorizado, solo administradores' });
  }
};

module.exports = { protect, admin };
