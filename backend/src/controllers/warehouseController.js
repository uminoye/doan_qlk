const warehouseService = require('../services/warehouseService');

const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await warehouseService.getWarehouses();
    res.json({ success: true, warehouses });
  } catch (error) {
    console.error("Lỗi lấy danh sách kho:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tải danh sách kho!' });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Bắt lỗi nếu người dùng để trống tên kho
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên kho hàng!' });
    }

    const newWarehouse = await warehouseService.addWarehouseWithLocations(req.body);
    
    res.json({ 
      success: true, 
      message: `🎉 Đã tạo thành công "${newWarehouse.name}" và tự động thiết lập 3000 vị trí kệ!`,
      warehouse: newWarehouse 
    });
  } catch (error) {
    console.error("Lỗi tạo kho:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllWarehouses,
  createWarehouse
};