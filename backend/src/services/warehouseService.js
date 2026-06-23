const db = require('../models/db');

// 1. Hàm lấy danh sách kho
const getWarehouses = async () => {
  try {
    const result = await db.query('SELECT * FROM warehouses ORDER BY id DESC');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// 2. Hàm tạo kho mới + Tự động sinh kệ theo số lượng người dùng nhập
const addWarehouseWithLocations = async (warehouseData) => {
  try {
    await db.query('BEGIN'); // Mở Giao dịch (Transaction)

    // Nhận thêm biến capacity (Sức chứa) từ Frontend
    const { name, capacity } = warehouseData; 
    const binCount = capacity ? parseInt(capacity) : 200; // Mặc định 200 kệ/khu nếu không nhập
    
    // Tạo Mã kho ngẫu nhiên (Ví dụ: WH-123456)
    const warehouse_code = 'WH-' + Math.floor(100000 + Math.random() * 900000);

    const insertWhQuery = `
      INSERT INTO warehouses (warehouse_code, name) 
      VALUES ($1, $2) RETURNING *
    `;
    const whResult = await db.query(insertWhQuery, [warehouse_code, name]); 
    const newWarehouse = whResult.rows[0];

    // Danh sách 16 khu vực (Zones) chuẩn theo config của em
    const zones = [
      'TV-SN', 'TV-SS', 'TV-LG', 'TV-TC', 
      'TL-PNS', 'TL-AQ', 'TL-TSB', 'TL-HTC', 
      'MG-EL', 'MG-LG', 'MG-TSB', 'MG-AQ', 
      'ML-DK', 'ML-PNS', 'ML-CP', 'ML-SP'
    ];

    // Tự động quét vòng lặp SQL tạo hàng loạt kệ theo số lượng yêu cầu
    const generateLocationsQuery = `
      INSERT INTO locations (warehouse_id, location_code, zone_code, aisle, rack, shelf, bin, status)
      SELECT 
          $1, 
          zone || '-A1-R1-S1-B' || num, 
          zone, 
          1, 1, 1, num, 
          'EMPTY'
      FROM 
          unnest($2::text[]) AS zone,
          generate_series(1, $3::integer) AS num
      ON CONFLICT (location_code) DO NOTHING;
    `;
    
    await db.query(generateLocationsQuery, [newWarehouse.id, zones, binCount]);

    await db.query('COMMIT'); // Chốt lưu toàn bộ vào DB
    return newWarehouse;

  } catch (error) {
    await db.query('ROLLBACK'); // Lỗi thì hoàn tác, không sinh ra rác
    throw new Error('Lỗi Database khi tạo kho: ' + error.message);
  }
};

module.exports = {
  getWarehouses,
  addWarehouseWithLocations
};