const inboundService = require('../services/inboundService');

const handleInbound = async (req, res) => {
  try {
    const { user_id, items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Chưa chọn sản phẩm để nhập kho!' });
    }

    const result = await inboundService.createInboundReceipt(user_id, items);
    
    res.json({
      success: true,
      message: `🎉 Nhập kho thành công! Mã phiếu: ${result.receiptCode}`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { handleInbound };