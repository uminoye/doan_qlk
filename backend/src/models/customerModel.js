const db = require('./db');

const addCustomer = async (customerCode, name, phone, address) => {
  const result = await db.query(
    `INSERT INTO customers (customer_code, name, phone, address) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [customerCode, name, phone, address]
  );
  return result.rows[0];
};

const getAllCustomers = async () => {
  const result = await db.query('SELECT * FROM customers ORDER BY id DESC');
  return result.rows;
};

module.exports = { addCustomer, getAllCustomers };