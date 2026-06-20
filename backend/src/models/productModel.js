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

// Sửa thông tin sản phẩm
const updateProduct = async (id, name, category, brand, size, type, unit, price, img) => {
  const query = `
    UPDATE products 
    SET name = $1, category_code = $2, brand_code = $3, size_or_capacity = $4, 
        type_detail = $5, unit = $6, sale_price = $7, image_url = $8
    WHERE id = $9 RETURNING *;
  `;
  const result = await db.query(query, [name, category, brand, size, type, unit, price, img, id]);
  return result.rows[0];
};

// Xóa sản phẩm
const deleteProduct = async (id) => {
  await db.query('DELETE FROM products WHERE id = $1', [id]);
};

module.exports = { countProductsByPrefix, createProduct, getAllProducts, updateProduct, deleteProduct };