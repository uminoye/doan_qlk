const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/create', verifyToken, customerController.registerCustomer);
router.get('/', verifyToken, customerController.getCustomers);

module.exports = router;