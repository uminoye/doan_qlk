const inventoryService = require('../services/inventoryService');

const getStock = async (req, res) => {
  try {
    const stock = await inventoryService.checkStock();
    res.json({
      success: true,
      message: 'Lấy báo cáo tồn kho thành công!',
      total_items_in_stock: stock.length,
      data: stock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu tồn kho!' });
  }
};

module.exports = { getStock };