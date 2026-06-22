const productService = require('../services/productService');

const createProduct = async (req, res) => {
  try {
    const newProduct = await productService.addProduct(req.body);
    res.json({ success: true, message: '🎉 Đã thêm sản phẩm thành công!', product: newProduct });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm sản phẩm!' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách!' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; 
    const updatedProduct = await productService.editProduct(id, req.body);
    if (!updatedProduct) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
    res.json({ success: true, message: 'Đã cập nhật thành công!', product: updatedProduct });
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật!' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.removeProduct(id);
    res.json({ success: true, message: 'Đã xóa sản phẩm và dọn sạch lịch sử giao dịch liên quan!' });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa: ' + error.message });
  }
};

module.exports = { createProduct, getAllProducts, updateProduct, deleteProduct };