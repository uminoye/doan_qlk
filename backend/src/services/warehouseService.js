const db = require('../models/db'); // Đường dẫn chuẩn trỏ tới file cấu hình DB của em

// Lấy danh sách tất cả các kho
const getWarehouses = async () => {
  try {
    const result = await db.query('SELECT * FROM warehouses ORDER BY id DESC');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Tạo kho mới + Tự động sinh 3000 kệ (Khu A, B, C)
const addWarehouseWithLocations = async (warehouseData) => {
  try {
    await db.query('BEGIN'); // Mở Giao dịch (Transaction)

    const { name } = warehouseData; // Chỉ lấy name, bỏ address
    
    // 1. Tạo kho mới (Đã bỏ cột address)
    const insertWhQuery = `
      INSERT INTO warehouses (name) 
      VALUES ($1) RETURNING *
    `;
    const whResult = await db.query(insertWhQuery, [name]); 
    const newWarehouse = whResult.rows[0];

    // 2. Sinh 3000 kệ tự động cho kho này
    const generateLocationsQuery = `
      INSERT INTO locations (warehouse_id, zone_code, bin_code)
      SELECT 
          $1, 
          zone, 
          zone || '-' || LPAD(num::text, 4, '0') 
      FROM 
          unnest(ARRAY['A', 'B', 'C']) AS zone,
          generate_series(1, 1000) AS num;
    `;
    await db.query(generateLocationsQuery, [newWarehouse.id]);

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