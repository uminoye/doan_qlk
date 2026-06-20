const salesService = require('../services/salesService');

const createSalesOrder = async (req, res) => {
  try {
    const { customer_id, sale_person_id, items } = req.body;
    const result = await salesService.placeOrder(customer_id, sale_person_id, items);
    
    res.json({ 
      success: true, 
      message: `Tạo đơn thành công! Mã đơn: ${result.orderCode}. Tổng tiền: ${result.totalAmount.toLocaleString('vi-VN')} VNĐ. Chờ sếp duyệt!` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveSalesOrder = async (req, res) => {
  try {
    const { id } = req.params; 
    const { manager_id } = req.body;
    
    await salesService.authorizeOrder(id, manager_id);
    res.json({ success: true, message: `✅ Sếp đã duyệt đơn! Gửi yêu cầu qua kho để xuất hàng ngay!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSalesOrder, approveSalesOrder };