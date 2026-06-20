const express = require('express');
const router = express.Router();
const factoryController = require('../controllers/factoryController');
const { verifyManager } = require('../middlewares/authMiddleware');

router.post('/create', factoryController.createRequest);

// Bác bảo vệ đứng gác ở đây: Đi qua bảo vệ mới được gặp Tổ trưởng (Controller)
router.put('/approve/:id', verifyManager, factoryController.approveRequest);
router.post('/scan', factoryController.scanBarcode);

module.exports = router;