const customerModel = require('../models/customerModel');

const createCustomer = async (name, phone, address) => {
  // Máy tự đẻ mã Khách hàng (VD: KH-8829)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const customerCode = `KH-${randomNum}`;

  return await customerModel.addCustomer(customerCode, name, phone, address);
};

module.exports = { createCustomer };