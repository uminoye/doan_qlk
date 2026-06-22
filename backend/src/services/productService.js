const productModel = require('../models/productModel');
const db = require('../models/db');

const addProduct = async (data) => {
  const { name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url, inventory, warehouse_id } = data;

  // Xử lý tạo mã SKU
  let skuPrefix = `${category_code}-${brand_code}`;
  if (size_or_capacity) skuPrefix += `-${size_or_capacity}`;

  const currentCount = await productModel.countProductsByPrefix(skuPrefix);
  const sequenceString = (currentCount + 1).toString().padStart(3, '0');
  const finalSKU = `${skuPrefix}-${sequenceString}`;

  // Gọi Thủ Kho để lưu
  const newProduct = await productModel.createProduct(
    finalSKU, name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url
  );

  // Cập nhật tồn kho ban đầu
  if (inventory !== undefined && inventory > 0) {
    await productModel.updateInventory(newProduct.id, warehouse_id || 1, inventory);
  }

  return newProduct;
};

const getProducts = async () => {
  return await productModel.getAllProducts();
};

const editProduct = async (id, data) => {
  const { name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url, inventory, warehouse_id } = data;

  // Cập nhật thông tin sản phẩm
  const updatedProduct = await productModel.updateProduct(id, name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url);

  // Cập nhật tồn kho nếu có
  if (inventory !== undefined) {
    await productModel.updateInventory(id, warehouse_id || 1, inventory);
  }

  return updatedProduct;
};

const removeProduct = async (id) => {
  try {
    // 1. Dọn dẹp bảng Tồn kho (Dùng try-catch để lỡ thiếu bảng web cũng không bị sập)
    try { await db.query('DELETE FROM inventory WHERE product_id = $1', [id]); } catch (e) {}

    // 2. Dọn dẹp chi tiết phiếu nhập
    try { await db.query('DELETE FROM inbound_details WHERE product_id = $1', [id]); } catch (e) {}

    // 3. Dọn dẹp chi tiết phiếu xuất
    try { await db.query('DELETE FROM outbound_details WHERE product_id = $1', [id]); } catch (e) {}

    // 4. Dọn dẹp chi tiết đơn hàng
    try { await db.query('DELETE FROM sales_order_details WHERE product_id = $1', [id]); } catch (e) {}

    // 5. Sau khi cắt đứt mọi liên kết, tiến hành xóa sản phẩm
    const result = await db.query('DELETE FROM products WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      throw new Error('Không tìm thấy sản phẩm trong Database!');
    }
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = { addProduct, getProducts, editProduct, removeProduct };