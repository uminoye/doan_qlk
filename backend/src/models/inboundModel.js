const db = require('./db');

// ============================================
// LẤY THÔNG TIN SẢN PHẨM
// ============================================
const getProductInfo = async (productId) => {
  const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
  return result.rows[0];
};

const getProductsByCategory = async (categoryCode, brandCode) => {
  const result = await db.query(
    `SELECT * FROM products WHERE category_code = $1 AND brand_code = $2 ORDER BY id`,
    [categoryCode, brandCode]
  );
  return result.rows;
};

const getProductBySKU = async (sku) => {
  const result = await db.query('SELECT * FROM products WHERE sku = $1', [sku]);
  return result.rows[0];
};

// ============================================
// TÌM KIẾM VỊ TRÍ BIN TRỐNG
// ============================================

/**
 * Tìm các Bin trống trong đúng Khu vực (Zone)
 * Ưu tiên xếp: Tầng thấp → Tầng cao, Kệ gần → Kệ xa (theo lối đi xe nâng)
 * Định dạng: TV-SN-A1-R1-S1-B1 (Zone-Aisle-Rack-Shelf-Bin)
 */
const getEmptyBinsByZone = async (zoneCode, neededQty) => {
  const result = await db.query(
    `SELECT id, location_code, aisle, rack, shelf, bin 
     FROM locations 
     WHERE zone_code = $1 AND status = 'EMPTY' 
     ORDER BY aisle ASC, rack ASC, shelf ASC, bin ASC 
     LIMIT $2`,
    [zoneCode, neededQty]
  );
  return result.rows;
};

/**
 * Lấy tất cả Bin trống trong kho (để xem tổng quan)
 */
const getAllEmptyBins = async () => {
  const result = await db.query(
    `SELECT id, location_code, zone_code, aisle, rack, shelf, bin 
     FROM locations 
     WHERE status = 'EMPTY' 
     ORDER BY zone_code, aisle, rack, shelf, bin`
  );
  return result.rows;
};

/**
 * Đếm số Bin trống còn lại trong mỗi khu vực
 */
const getEmptyBinCountByZone = async () => {
  const result = await db.query(
    `SELECT zone_code, COUNT(*) as empty_count 
     FROM locations 
     WHERE status = 'EMPTY' 
     GROUP BY zone_code 
     ORDER BY zone_code`
  );
  return result.rows;
};

// ============================================
// QUẢN LÝ PHIẾU NHẬP KHO
// ============================================

/**
 * Tạo mới một Phiếu Nhập kho
 * Cấu trúc bảng thực tế: id, receipt_code, user_id, status, created_at
 */
const createInboundReceipt = async (receiptCode, userId) => {
  const result = await db.query(
    `INSERT INTO inbound_receipts (receipt_code, user_id, status, created_at) 
     VALUES ($1, $2, 'PENDING', NOW()) 
     RETURNING id`,
    [receiptCode, userId]
  );
  return result.rows[0].id;
};

/**
 * Thêm chi tiết phiếu nhập (1 dòng = 1 sản phẩm tại 1 vị trí)
 * Cấu trúc bảng thực tế: id, receipt_id, product_id, location_id, quantity
 */
const addInboundDetail = async (receiptId, productId, locationId, quantity) => {
  const result = await db.query(
    `INSERT INTO inbound_details (receipt_id, product_id, location_id, quantity) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id`,
    [receiptId, productId, locationId, quantity]
  );
  return result.rows[0].id;
};

/**
 * Cập nhật tồn kho (tăng số lượng)
 * Sử dụng ON CONFLICT để upsert - nếu đã có record thì cộng thêm, chưa có thì tạo mới
 */
const updateInventory = async (productId, warehouseId, quantityToAdd) => {
  const result = await db.query(
    `INSERT INTO inventory (product_id, warehouse_id, quantity) 
     VALUES ($1, $2, $3)
     ON CONFLICT (product_id, warehouse_id) 
     DO UPDATE SET quantity = inventory.quantity + $3
     RETURNING quantity`,
    [productId, warehouseId, quantityToAdd]
  );
  return result.rows[0];
};

/**
 * Cập nhật trạng thái Bin: ĐÁNH DẤU ĐẦY + ghi sản phẩm vào
 */
const occupyBin = async (locationId, productId, quantity) => {
  await db.query(
    `UPDATE locations 
     SET status = 'FULL', product_id = $1, current_qty = $2 
     WHERE id = $3`,
    [productId, quantity, locationId]
  );
};

/**
 * Lấy danh sách tất cả phiếu nhập kho (có phân trang)
 * Cấu trúc bảng thực tế: id, receipt_code, user_id, status, created_at
 */
const getAllInboundReceipts = async (limit = 50, offset = 0) => {
  const result = await db.query(
    `SELECT ir.id, ir.receipt_code, ir.user_id, ir.status, ir.created_at,
            u.full_name as user_name, u.role as user_role
     FROM inbound_receipts ir
     LEFT JOIN users u ON ir.user_id = u.id
     ORDER BY ir.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

/**
 * Lấy chi tiết 1 phiếu nhập (bao gồm các dòng sản phẩm)
 */
const getInboundReceiptDetails = async (receiptId) => {
  const result = await db.query(
    `SELECT id_item.id as detail_id, id_item.receipt_id, id_item.product_id, id_item.location_id, 
            id_item.quantity,
            p.sku, p.name AS productName, p.category_code, p.brand_code,
            l.location_code AS locationCode, l.zone_code AS zoneCode, l.aisle, l.rack, l.shelf, l.bin
     FROM inbound_details id_item
     JOIN products p ON id_item.product_id = p.id
     JOIN locations l ON id_item.location_id = l.id
     WHERE id_item.receipt_id = $1
     ORDER BY l.zone_code, l.aisle, l.rack, l.shelf, l.bin`,
    [receiptId]
  );
  return result.rows;
};

/**
 * Cập nhật trạng thái phiếu nhập (PENDING → APPROVED / REJECTED)
 */
const updateReceiptStatus = async (receiptId, newStatus) => {
  await db.query(
    `UPDATE inbound_receipts SET status = $1 WHERE id = $2`,
    [newStatus, receiptId]
  );
};

/**
 * Lấy 1 phiếu nhập theo ID
 */
const getInboundReceiptById = async (receiptId) => {
  const result = await db.query(
    `SELECT ir.*, u.full_name as user_name
     FROM inbound_receipts ir
     LEFT JOIN users u ON ir.user_id = u.id
     WHERE ir.id = $1`,
    [receiptId]
  );
  return result.rows[0];
};

/**
 * Đếm tổng số phiếu nhập (để phân trang)
 */
const countInboundReceipts = async () => {
  const result = await db.query('SELECT COUNT(*) as total FROM inbound_receipts');
  return parseInt(result.rows[0].total);
};

/**
 * Tạo mã phiếu nhập tự động: PN-YYYYMMDD-XXXX
 */
const generateReceiptCode = async () => {
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  
  // Đếm số phiếu trong ngày để tạo số thứ tự
  const countResult = await db.query(
    `SELECT COUNT(*) as count FROM inbound_receipts 
     WHERE receipt_code LIKE $1`,
    [`PN-${dateString}-%`]
  );
  
  const sequence = (parseInt(countResult.rows[0].count) + 1).toString().padStart(4, '0');
  return `PN-${dateString}-${sequence}`;
};

module.exports = {
  // Product queries
  getProductInfo,
  getProductsByCategory,
  getProductBySKU,
  
  // Location queries
  getEmptyBinsByZone,
  getAllEmptyBins,
  getEmptyBinCountByZone,
  
  // Inventory operations
  updateInventory,
  occupyBin,
  
  // Receipt operations
  createInboundReceipt,
  addInboundDetail,
  getAllInboundReceipts,
  getInboundReceiptDetails,
  getInboundReceiptById,
  updateReceiptStatus,
  countInboundReceipts,
  generateReceiptCode
};
