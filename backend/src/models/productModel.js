const db = require('./db');

// Đếm sản phẩm để làm mã SKU
const countProductsByPrefix = async (prefix) => {
  const result = await db.query('SELECT COUNT(*) FROM products WHERE sku LIKE $1', [`${prefix}%`]);
  return parseInt(result.rows[0].count);
};

// Lưu sản phẩm mới
const createProduct = async (sku, name, category, brand, size, type, unit, price, img) => {
  const query = `
    INSERT INTO products (sku, name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
  `;
  const result = await db.query(query, [sku, name, category, brand, size, type, unit, price, img]);
  return result.rows[0];
};

// Lấy danh sách
const getAllProducts = async () => {
  const result = await db.query('SELECT * FROM products ORDER BY id DESC');
  return result.rows;
};

module.exports = { countProductsByPrefix, createProduct, getAllProducts };