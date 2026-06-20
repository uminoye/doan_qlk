const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Mở một đường link bí mật để kích hoạt ma thuật
router.post('/generate', locationController.generateLocations);

module.exports = router;