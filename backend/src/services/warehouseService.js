const db = require('../models/db'); // Đường dẫn trỏ tới DB

// 1. Hàm lấy danh sách kho
const getWarehouses = async () => {
  try {
    const result = await db.query('SELECT * FROM warehouses ORDER BY id DESC');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// 2. Hàm tạo kho mới + Tự động sinh kệ
const addWarehouseWithLocations = async (warehouseData) => {
  try {
    await db.query('BEGIN'); // Mở Giao dịch (Transaction)

    const { name } = warehouseData;
    
    // Tự động tạo Mã kho ngẫu nhiên (Ví dụ: WH-123456)
    const warehouse_code = 'WH-' + Math.floor(100000 + Math.random() * 900000);

    // Tạo kho mới (Thêm cột warehouse_code)
    const insertWhQuery = `
      INSERT INTO warehouses (warehouse_code, name) 
      VALUES ($1, $2) RETURNING *
    `;
    const whResult = await db.query(insertWhQuery, [warehouse_code, name]); 
    const newWarehouse = whResult.rows[0];

    // Sinh 3000 kệ tự động cho kho này
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
    await db.query('ROLLBACK'); // Lỗi thì hoàn tác
    throw new Error('Lỗi Database khi tạo kho: ' + error.message);
  }
};

// ĐÂY CHÍNH LÀ NƠI GÂY RA LỖI NẾU THIẾU NÈ:
module.exports = {
  getWarehouses,
  addWarehouseWithLocations
};