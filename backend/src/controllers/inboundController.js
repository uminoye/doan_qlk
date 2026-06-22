const inboundService = require('../services/inboundService');

// ============================================
// TẠO PHIẾU NHẬP KHO MỚI
// POST /api/inbound
// ============================================
const handleInbound = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user?.id || req.body.user_id;

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Danh sách sản phẩm trống! Vui lòng thêm ít nhất 1 sản phẩm.' 
      });
    }

    // Validate từng item
    for (let item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Mỗi sản phẩm phải có productId và quantity > 0'
        });
      }
    }

    const result = await inboundService.createInboundReceipt(userId, items);
    
    res.json({
      success: true,
      message: `Nhập kho thành công! Mã phiếu: ${result.receiptCode}`,
      data: result
    });
  } catch (error) {
    console.error('Inbound Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LẤY DANH SÁCH PHIẾU NHẬP
// GET /api/inbound
// ============================================
const getInboundReceipts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await inboundService.getInboundReceipts(page, limit);
    
    res.json({
      success: true,
      data: result.receipts,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get Receipts Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LẤY CHI TIẾT 1 PHIẾU NHẬP
// GET /api/inbound/:id
// ============================================
const getInboundReceiptById = async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    
    if (!receiptId) {
      return res.status(400).json({ success: false, message: 'ID phiếu nhập không hợp lệ' });
    }

    const receipt = await inboundService.getReceiptDetails(receiptId);
    
    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Get Receipt Detail Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GỢI Ý VỊ TRÍ BIN
// POST /api/inbound/suggest-bins
// ============================================
const suggestBins = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn sản phẩm' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Số lượng phải lớn hơn 0' });
    }

    const result = await inboundService.suggestBinLocations(product_id, quantity);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Suggest Bins Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LẤY TỔNG QUAN KHO (TRẠNG THÁI CÁC KHU VỰC)
// GET /api/inbound/warehouse-overview
// ============================================
const getWarehouseOverview = async (req, res) => {
  try {
    const result = await inboundService.getWarehouseOverview();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Warehouse Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DUYỆT PHIẾU NHẬP KHO
// PUT /api/inbound/:id/approve
// ============================================
const approveInbound = async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    const { action } = req.body; // 'approve' hoặc 'reject'

    if (!receiptId) {
      return res.status(400).json({ success: false, message: 'ID phiếu nhập không hợp lệ' });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action phải là "approve" hoặc "reject"' 
      });
    }

    const result = await inboundService.approveReceipt(receiptId, action);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Approve Inbound Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleInbound,
  getInboundReceipts,
  getInboundReceiptById,
  suggestBins,
  getWarehouseOverview,
  approveInbound
};
