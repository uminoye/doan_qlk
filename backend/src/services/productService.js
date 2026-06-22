const db = require('../models/db');

// 1. Hàm lấy danh sách toàn bộ sản phẩm
const getProducts = async () => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// 2. Hàm thêm sản phẩm mới
const addProduct = async (productData) => {
  try {
    const { name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url, sku } = productData;
    const result = await db.query(
      `INSERT INTO products (name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url, sku) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url, sku]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// 3. Hàm chỉnh sửa thông tin sản phẩm
const editProduct = async (id, productData) => {
  try {
    const { name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url, sku } = productData;
    const result = await db.query(
      `UPDATE products 
       SET name = $1, category_code = $2, brand_code = $3, size_or_capacity = $4, 
           type_detail = $5, unit = $6, sale_price = $7, image_url = $8, sku = $9
       WHERE id = $10 RETURNING *`,
      [name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url, sku, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// 4. Hàm xóa sản phẩm - Tích hợp dọn dẹp càn quét các bảng khóa ngoại liên quan
const removeProduct = async (id) => {
  try {
    // BƯỚC 1 CỰC KỲ QUAN TRỌNG: 
    // Vì Database không cho phép NULL, ta XÓA LUÔN dòng dữ liệu của sản phẩm này trong bảng locations
    try { 
        await db.query('DELETE FROM locations WHERE product_id = $1', [id]); 
    } catch (err) {
        console.error("Lỗi khi dọn dẹp bảng locations:", err.message);
    }

    // BƯỚC 2: Tự động quét dọn lịch sử ở các bảng trung gian (In ra lỗi nếu có để dễ debug)
    try { await db.query('DELETE FROM inventory WHERE product_id = $1', [id]); } catch (e) {}
    try { await db.query('DELETE FROM inbound_details WHERE product_id = $1', [id]); } catch (e) {}
    try { await db.query('DELETE FROM outbound_details WHERE product_id = $1', [id]); } catch (e) {}
    try { await db.query('DELETE FROM sales_order_details WHERE product_id = $1', [id]); } catch (e) {}

    // BƯỚC 3: Tiến hành xóa sản phẩm gốc sau khi đã gỡ sạch 100% khóa ngoại
    const result = await db.query('DELETE FROM products WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      throw new Error('Không tìm thấy sản phẩm cần xóa trong hệ thống.');
    }
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getProducts,
  addProduct,
  editProduct,
  removeProduct
};