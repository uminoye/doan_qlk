const productService = require('../services/productService');

const createProduct = async (req, res) => {
  try {
    const newProduct = await productService.addProduct(req.body);
    res.json({ success: true, message: '🎉 Đã thêm sản phẩm thành công!', product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm sản phẩm!' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách!' });
  }
};

module.exports = { createProduct, getAllProducts };