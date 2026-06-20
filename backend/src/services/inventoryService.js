const inventoryModel = require('../models/inventoryModel');

const checkStock = async () => {
  return await inventoryModel.getInventoryList();
};

module.exports = { checkStock };