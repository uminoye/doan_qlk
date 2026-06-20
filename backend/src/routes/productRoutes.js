const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/:id', productController.updateProduct); // Cửa để Sửa
router.delete('/:id', productController.deleteProduct); // Cửa để Xóa

module.exports = router;