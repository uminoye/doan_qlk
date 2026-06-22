const db = require('./db');

// Lập lệnh giao dịch mới
const createOrder = async (customerId, salePersonId, orderCode, totalAmount, items) => {
  const orderRes = await db.query(
    `INSERT INTO sales_orders (order_code, customer_id, sale_person_id, total_amount, status, created_at) 
     VALUES ($1, $2, $3, $4, 'PENDING', NOW()) RETURNING id`,
    [orderCode, customerId, salePersonId, totalAmount]
  );
  const orderId = orderRes.rows[0].id;

  for (let item of items) {
    await db.query(
      `INSERT INTO sales_order_details (order_id, product_id, quantity, unit_price) 
       VALUES ($1, $2, $3, $4)`,
       [orderId, item.productId, item.quantity, item.unitPrice]
    );
  }
  return orderId;
};

// Duyệt đơn hàng
const approveOrder = async (orderId, managerId) => {
  const result = await db.query(
    `UPDATE sales_orders 
     SET status = 'APPROVED', approved_by = $1 
     WHERE id = $2 RETURNING *`,
    [managerId, orderId]
  );
  return result.rows[0];
};

// Lấy toàn bộ danh sách đơn hàng (Bổ sung mới)
const getAllOrders = async () => {
  const result = await db.query(`
    SELECT so.*, u.full_name as sale_person_name, c.name as customer_name
    FROM sales_orders so
    LEFT JOIN users u ON so.sale_person_id = u.id
    LEFT JOIN customers c ON so.customer_id = c.id
    ORDER BY so.created_at DESC
  `);
  return result.rows;
};

// Lấy thông tin 1 đơn hàng theo ID (Bổ sung mới)
const getOrderById = async (id) => {
  const result = await db.query(`
    SELECT so.*, u.full_name as sale_person_name, c.name as customer_name
    FROM sales_orders so
    LEFT JOIN users u ON so.sale_person_id = u.id
    LEFT JOIN customers c ON so.customer_id = c.id
    WHERE so.id = $1
  `, [id]);
  return result.rows[0];
};

// Lấy danh sách sản phẩm bên trong đơn hàng đó (Bổ sung mới)
const getOrderDetails = async (orderId) => {
  const result = await db.query(`
    SELECT sod.*, p.sku, p.name as product_name, p.category_code
    FROM sales_order_details sod
    JOIN products p ON sod.product_id = p.id
    WHERE sod.order_id = $1
  `, [orderId]);
  return result.rows;
};

module.exports = { createOrder, approveOrder, getAllOrders, getOrderById, getOrderDetails };