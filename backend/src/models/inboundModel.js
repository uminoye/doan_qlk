const db = require('./db');

// Lấy thông tin sản phẩm để biết nó thuộc Khu vực nào
const getProductInfo = async (productId) => {
  const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
  return result.rows[0];
};

// Tìm các Bin đang trống trong đúng Khu vực đó
const getEmptyBins = async (zoneCode, neededQty) => {
  // Ưu tiên xếp từ Tầng 1 lên Tầng trên, từ Kệ 1 đến Kệ cuối cho khoa học
  const result = await db.query(
    `SELECT id, location_code FROM locations 
     WHERE zone_code = $1 AND status = 'EMPTY' 
     ORDER BY aisle, rack, shelf, bin LIMIT $2`,
    [zoneCode, neededQty]
  );
  return result.rows;
};

// Thực hiện lưu Phiếu nhập và cất hàng vào Bin
const executeInbound = async (userId, receiptCode, productDetails) => {
  // 1. Tạo tờ Phiếu Nhập
  const receiptRes = await db.query(
    `INSERT INTO inbound_receipts (receipt_code, user_id) VALUES ($1, $2) RETURNING id`,
    [receiptCode, userId]
  );
  const receiptId = receiptRes.rows[0].id;

  // 2. Đi cất từng món hàng vào Bin
  for (let item of productDetails) {
    for (let bin of item.bins) {
      // Đổi trạng thái Bin thành ĐÃ ĐẦY và ghi tên sản phẩm vào
      await db.query(
        `UPDATE locations SET status = 'FULL', product_id = $1, current_qty = 1 WHERE id = $2`,
        [item.productId, bin.id]
      );
      
      // Ghi dòng chi tiết vào Phiếu Nhập
      await db.query(
        `INSERT INTO inbound_details (receipt_id, product_id, location_id, quantity) VALUES ($1, $2, $3, 1)`,
        [receiptId, item.productId, bin.id]
      );
    }
  }
  return receiptId;
};

module.exports = { getProductInfo, getEmptyBins, executeInbound };