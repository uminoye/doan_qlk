const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { verifyToken, verifyManager } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, salesController.createSalesOrder);
router.get('/', verifyToken, salesController.getSalesOrders);
router.get('/:id', verifyToken, salesController.getSalesOrderById);
router.put('/approve/:id', verifyManager, salesController.approveSalesOrder);

module.exports = router;