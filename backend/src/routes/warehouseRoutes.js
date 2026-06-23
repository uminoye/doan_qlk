const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');

// Không cần middleware xác thực vội để em test cho dễ, sau này thêm verifyToken sau
router.get('/', warehouseController.getAllWarehouses);
router.post('/', warehouseController.createWarehouse);

module.exports = router;