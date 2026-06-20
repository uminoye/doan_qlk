const productModel = require('../models/productModel');

const addProduct = async (data) => {
  const { name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url } = data;

  // Xử lý tạo mã SKU
  let skuPrefix = `${category_code}-${brand_code}`;
  if (size_or_capacity) skuPrefix += `-${size_or_capacity}`;

  const currentCount = await productModel.countProductsByPrefix(skuPrefix);
  const sequenceString = (currentCount + 1).toString().padStart(3, '0');
  const finalSKU = `${skuPrefix}-${sequenceString}`;

  // Gọi Thủ Kho để lưu
  return await productModel.createProduct(
    finalSKU, name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url
  );
};

const getProducts = async () => {
  return await productModel.getAllProducts();
};

const editProduct = async (id, data) => {
  const { name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url } = data;
  return await productModel.updateProduct(id, name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url);
};

const removeProduct = async (id) => {
  await productModel.deleteProduct(id);
};

module.exports = { addProduct, getProducts, editProduct, removeProduct };