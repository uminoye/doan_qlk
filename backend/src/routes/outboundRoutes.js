const express = require('express');
const router = express.Router();
const outboundController = require('../controllers/outboundController');

router.post('/', outboundController.handleOutbound);

module.exports = router;