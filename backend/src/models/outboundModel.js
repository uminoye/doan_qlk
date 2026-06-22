const db = require('./db');

// Tìm các Bin đang chứa đúng món hàng mà khách cần lấy
const getAvailableBins = async (productId, neededQty) => {
  const result = await db.query(
    `SELECT id, location_code FROM locations 
     WHERE product_id = $1 AND status = 'FULL' 
     ORDER BY aisle, rack, shelf, bin LIMIT $2`,
    [productId, neededQty]
  );
  return result.rows;
};

// Thực hiện tạo Phiếu Xuất và lấy hàng ra khỏi Bin
const executeOutbound = async (userId, receiptCode, productDetails) => {
  const receiptRes = await db.query(
    `INSERT INTO outbound_receipts (receipt_code, user_id) VALUES ($1, $2) RETURNING id`,
    [receiptCode, userId]
  );
  const receiptId = receiptRes.rows[0].id;

  for (let item of productDetails) {
    for (let bin of item.bins) {
      // Dọn sạch Bin: Đổi thành EMPTY, xóa tên sản phẩm, đưa số lượng về 0
      await db.query(
        `UPDATE locations SET status = 'EMPTY', product_id = NULL, current_qty = 0, updated_at = NOW() WHERE id = $1`,
        [bin.id]
      );
      
      // Ghi lịch sử xuất kho
      await db.query(
        `INSERT INTO outbound_details (receipt_id, product_id, location_id, quantity) VALUES ($1, $2, $3, 1)`,
        [receiptId, item.productId, bin.id]
      );
    }
    
    // ĐIỂM CHỐT QUAN TRỌNG: Trừ tổng tồn kho trong bảng inventory
    await db.query(
      `UPDATE inventory 
       SET quantity = quantity - $1, updated_at = NOW() 
       WHERE product_id = $2 AND warehouse_id = 1`,
      [item.quantity, item.productId]
    );
  }
  return receiptId;
};

module.exports = { getAvailableBins, executeOutbound };