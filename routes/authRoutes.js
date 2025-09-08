const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ fixed import

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Profile (protected)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;

