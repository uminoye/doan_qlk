const salesService = require('../services/salesService');
const salesModel = require('../models/salesModel');

const createSalesOrder = async (req, res) => {
  try {
    const { customer_id, sale_person_id, items } = req.body;
    const result = await salesService.placeOrder(customer_id, sale_person_id, items);
    res.json({ success: true, message: `Tạo đơn thành công! Mã đơn: ${result.orderCode}.`, orderCode: result.orderCode, totalAmount: result.totalAmount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveSalesOrder = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user?.id || req.body.manager_id;
    
    await salesService.authorizeOrder(id, userId);
    res.json({ success: true, message: `✅ Đơn hàng đã được duyệt thành công!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalesOrders = async (req, res) => {
  try {
    const orders = await salesModel.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalesOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await salesModel.getOrderById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    const details = await salesModel.getOrderDetails(orderId);
    res.json({ success: true, data: { ...order, items: details } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSalesOrder, approveSalesOrder, getSalesOrders, getSalesOrderById };