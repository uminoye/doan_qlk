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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ đường link
    const updatedProduct = await productService.editProduct(id, req.body);
    if (!updatedProduct) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
    res.json({ success: true, message: 'Đã cập nhật thành công!', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật!' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.removeProduct(id);
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi kho!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa! Có thể sản phẩm này đang có tồn kho.' });
  }
};

module.exports = { createProduct, getAllProducts, updateProduct, deleteProduct };