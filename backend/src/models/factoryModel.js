const db = require('./db');

// Lập lệnh giao hàng mới
const createShipment = async (shipmentCode, factoryManagerId, items) => {
  const receiptRes = await db.query(
    `INSERT INTO factory_shipments (shipment_code, factory_manager_id) VALUES ($1, $2) RETURNING id`,
    [shipmentCode, factoryManagerId]
  );
  const shipmentId = receiptRes.rows[0].id;

  for (let item of items) {
    await db.query(
      `INSERT INTO factory_shipment_details (shipment_id, product_id, expected_qty) VALUES ($1, $2, $3)`,
      [shipmentId, item.productId, item.quantity]
    );
  }
  return shipmentId;
};

// Quản lý kho duyệt lệnh
const approveShipment = async (shipmentId, warehouseManagerId) => {
  const result = await db.query(
    `UPDATE factory_shipments 
     SET status = 'APPROVED', warehouse_manager_id = $1 
     WHERE id = $2 RETURNING *`,
    [shipmentId, warehouseManagerId]
  );
  return result.rows[0];
};

// Dịch mã vạch (SKU) ra thông tin sản phẩm
const getProductBySKU = async (sku) => {
  const result = await db.query('SELECT id, name FROM products WHERE sku = $1', [sku]);
  return result.rows[0];
};

// Cập nhật: Cứ mỗi lần quét là cộng thêm 1 vào cột scanned_qty
const updateScannedQuantity = async (shipmentId, productId) => {
  const result = await db.query(
    `UPDATE factory_shipment_details 
     SET scanned_qty = scanned_qty + 1 
     WHERE shipment_id = $1 AND product_id = $2 
     RETURNING expected_qty, scanned_qty`,
    [shipmentId, productId]
  );
  return result.rows[0];
};

// Ghi nhận hàng lỗi vào sổ và tăng biến đếm hàng lỗi lên 1
const recordDefectiveItem = async (shipmentId, productId, reason) => {
  // Tăng số đếm hàng lỗi
  await db.query(
    `UPDATE factory_shipment_details 
     SET defect_qty = defect_qty + 1 
     WHERE shipment_id = $1 AND product_id = $2`,
    [shipmentId, productId]
  );
  
  // Ghi lý do vào cuốn sổ
  await db.query(
    `INSERT INTO return_to_factory_logs (shipment_id, product_id, reason) 
     VALUES ($1, $2, $3)`,
    [shipmentId, productId, reason]
  );
};

module.exports = { createShipment, approveShipment, getProductBySKU, updateScannedQuantity, recordDefectiveItem };