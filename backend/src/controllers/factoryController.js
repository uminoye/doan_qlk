const factoryService = require('../services/factoryService');

const createRequest = async (req, res) => {
  try {
    const { factory_manager_id, items } = req.body;
    const code = await factoryService.requestShipment(factory_manager_id, items);
    res.json({ success: true, message: `Lệnh giao hàng ${code} đã được tạo. Đang chờ Trưởng Kho duyệt! (PENDING)` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const { id } = req.params; // ID của lệnh giao hàng
    const { warehouse_manager_id } = req.body; // Người duyệt
    
    await factoryService.authorizeShipment(id, warehouse_manager_id);
    res.json({ success: true, message: `✅ Lệnh giao hàng đã được duyệt (APPROVED)! Xe tải có thể chạy vào kho.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const scanBarcode = async (req, res) => {
  try {
    const { shipment_id, sku } = req.body;
    const result = await factoryService.scanItem(shipment_id, sku);
    
    if (result.status === 'DEFECTIVE') {
      res.json({ 
        success: false, 
        isDefective: true,
        message: `🚨 BÍP BÍP! PHÁT HIỆN HÀNG LỖI: ${result.productName}. Lý do: ${result.reason}. Đã chuyển vào khu vực Chờ Trả Nhà Máy!` 
      });
    } else {
      res.json({ 
        success: true, 
        isDefective: false,
        message: `*Tít!* Hàng chuẩn! Đã nhận 1 cái ${result.productName}. (Tiến độ hàng tốt: ${result.scanned}/${result.expected})` 
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createRequest, approveRequest, scanBarcode };