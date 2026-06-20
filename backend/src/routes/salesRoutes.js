const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
// Nhập khẩu camera an ninh vào đây
const { verifyManager } = require('../middlewares/authMiddleware');

// Chỉ có ai có thẻ bài hợp lệ và có chức danh MANAGER/ADMIN mới được duyệt đơn
router.put('/approve/:id', verifyManager, salesController.approveSalesOrder);

module.exports = router;