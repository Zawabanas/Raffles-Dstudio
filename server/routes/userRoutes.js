const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/:id', protect, admin, userController.updateUser);
router.delete('/:id', protect, admin, userController.deleteUser);
router.patch('/:id/toggleStatus', protect, admin, userController.toggleUserStatus);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
