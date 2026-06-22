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
  // 1. Kiểm tra tồn kho trước khi xóa
  const result = await db.query('SELECT quantity FROM inventory WHERE product_id = $1', [id]);
  const totalStock = result.rows.reduce((sum, row) => sum + row.quantity, 0);

  if (totalStock > 0) {
    throw new Error('Không thể xóa: Sản phẩm vẫn còn tồn kho trong ít nhất một kho!');
  }

  // 2. Nếu tồn kho = 0, thì xóa dữ liệu liên quan ở bảng inventory trước
  await db.query('DELETE FROM inventory WHERE product_id = $1', [id]);

  // 3. Xóa sản phẩm
  await productModel.deleteProduct(id);
};

module.exports = { addProduct, getProducts, editProduct, removeProduct };