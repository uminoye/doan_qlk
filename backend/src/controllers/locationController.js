const locationService = require('../services/locationService');

const generateLocations = async (req, res) => {
  try {
    const totalBins = await locationService.generateWarehouseLayout();
    res.json({ 
      success: true, 
      message: `🚀 Ma thuật thành công! Đã xây dựng tự động ${totalBins} vị trí Bin trong kho!` 
    });
  } catch (error) {
    console.error('Lỗi tạo sơ đồ kho:', error);
    res.status(500).json({ success: false, message: 'Máy chủ quá tải khi xây kho!' });
  }
};

module.exports = { generateLocations };