const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { verifyManager } = require('../middlewares/authMiddleware');

router.post('/create', salesController.createSalesOrder);
router.put('/approve/:id', verifyManager, salesController.approveSalesOrder);

module.exports = router;