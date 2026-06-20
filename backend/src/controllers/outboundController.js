const outboundService = require('../services/outboundService');

const handleOutbound = async (req, res) => {
  try {
    const { user_id, items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Chưa chọn sản phẩm để xuất kho!' });
    }

    const result = await outboundService.createOutboundReceipt(user_id, items);
    
    res.json({
      success: true,
      message: `🚀 Xuất kho thành công! Mã phiếu: ${result.receiptCode}`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { handleOutbound };