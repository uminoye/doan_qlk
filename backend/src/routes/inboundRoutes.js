const express = require('express');
const router = express.Router();
const inboundController = require('../controllers/inboundController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

// ============================================
// ROUTES PHIẾU NHẬP KHO
// ============================================

/**
 * POST /api/inbound
 * Tạo phiếu nhập kho mới
 * Quyền: ADMIN, KHO (nhân viên kho)
 */
router.post('/', 
  verifyToken, 
  requireRoles(['ADMIN', 'KHO']), 
  inboundController.handleInbound
);

/**
 * GET /api/inbound
 * Lấy danh sách phiếu nhập kho (có phân trang)
 * Quyền: Tất cả đã đăng nhập
 */
router.get('/', 
  verifyToken, 
  inboundController.getInboundReceipts
);

/**
 * GET /api/inbound/warehouse-overview
 * Lấy tổng quan trạng thái các khu vực trong kho
 * Quyền: Tất cả đã đăng nhập
 */
router.get('/warehouse-overview', 
  verifyToken, 
  inboundController.getWarehouseOverview
);

/**
 * GET /api/inbound/:id
 * Lấy chi tiết 1 phiếu nhập kho
 * Quyền: Tất cả đã đăng nhập
 */
router.get('/:id', 
  verifyToken, 
  inboundController.getInboundReceiptById
);

/**
 * POST /api/inbound/suggest-bins
 * Gợi ý vị trí Bin trống cho sản phẩm
 * Quyền: ADMIN, KHO
 */
router.post('/suggest-bins', 
  verifyToken, 
  requireRoles(['ADMIN', 'KHO']), 
  inboundController.suggestBins
);

/**
 * PUT /api/inbound/:id/approve
 * Duyệt hoặc từ chối phiếu nhập kho
 * Quyền: ADMIN, KHO (quản lý kho)
 */
router.put('/:id/approve', 
  verifyToken, 
  requireRoles(['ADMIN', 'KHO']), 
  inboundController.approveInbound
);

module.exports = router;
