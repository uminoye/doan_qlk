const salesModel = require('../models/salesModel');

const placeOrder = async (customerId, salePersonId, items) => {
  let totalAmount = 0;
  for (let item of items) {
    totalAmount += item.quantity * item.unitPrice;
  }

  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `SO-${dateString}-${randomNum}`;

  await salesModel.createOrder(customerId, salePersonId, orderCode, totalAmount, items);
  
  return { orderCode, totalAmount };
};

const authorizeOrder = async (orderId, managerId) => {
  return await salesModel.approveOrder(orderId, managerId);
};

module.exports = { placeOrder, authorizeOrder };