const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login); // Đúng đường dẫn là /api/auth/login
router.post('/register', authController.register);

module.exports = router;