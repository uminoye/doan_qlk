const locationModel = require('../models/locationModel');

const generateWarehouseLayout = async () => {
  // Cấu hình chuẩn theo bản thiết kế em cung cấp
  const configs = [
    { category: 'TV', brands: ['SN', 'SS', 'LG', 'TCL'], aisles: 4, racks: 5, shelves: 3, bins: 4 },
    { category: 'TL', brands: ['PNS', 'AQ', 'TSB', 'HTC'], aisles: 4, racks: 5, shelves: 2, bins: 4 },
    { category: 'MG', brands: ['EL', 'LG', 'TSB', 'AQ'], aisles: 4, racks: 5, shelves: 2, bins: 4 },
    { category: 'ML', brands: ['DK', 'PNS', 'CP', 'SP'], aisles: 4, racks: 5, shelves: 3, bins: 3 },
  ];

  let allLocations = [];

  // Vòng lặp "Ma thuật" tạo ra hàng ngàn Bin
  for (let config of configs) {
    for (let brand of config.brands) {
      let zone = `${config.category}-${brand}`; // Ví dụ: TV-SN

      for (let a = 1; a <= config.aisles; a++) {
        for (let r = 1; r <= config.racks; r++) {
          for (let s = 1; s <= config.shelves; s++) {
            for (let b = 1; b <= config.bins; b++) {
              // Ghép tên mã định danh (Ví dụ: TV-SN-A1-R2-S3-B4)
              let code = `${zone}-A${a}-R${r}-S${s}-B${b}`;
              allLocations.push({ code, zone, a, r, s, b });
            }
          }
        }
      }
    }
  }

  // Gửi mảng chứa gần 3000 vị trí này xuống cho Thủ Kho lưu
  await locationModel.insertBulkLocations(allLocations);
  return allLocations.length; // Trả về tổng số Bin đã tạo
};

module.exports = { generateWarehouseLayout };