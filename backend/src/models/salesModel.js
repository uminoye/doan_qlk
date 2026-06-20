const db = require('./db');

const createOrder = async (customerId, salePersonId, orderCode, totalAmount, items) => {
  const orderRes = await db.query(
    `INSERT INTO sales_orders (order_code, customer_id, sale_person_id, total_amount) 
     VALUES ($1, $2, $3, $4) RETURNING id`,
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

const approveOrder = async (orderId, managerId) => {
  const result = await db.query(
    `UPDATE sales_orders 
     SET status = 'APPROVED', approved_by = $1 
     WHERE id = $2 RETURNING *`,
    [orderId, managerId]
  );
  return result.rows[0];
};

module.exports = { createOrder, approveOrder };