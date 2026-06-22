const customerService = require('../services/customerService');
const customerModel = require('../models/customerModel');

const registerCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const newCustomer = await customerService.createCustomer(name, phone, address);
    res.json({ 
      success: true, 
      message: `Tạo khách hàng thành công! Mã tự sinh: ${newCustomer.customer_code}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await customerModel.getAllCustomers();
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerCustomer, getCustomers };