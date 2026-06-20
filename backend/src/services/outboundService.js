const outboundModel = require('../models/outboundModel');

const createOutboundReceipt = async (userId, items) => {
  let productDetails = [];

  // BƯỚC 1: Kiểm tra xem kho có đủ hàng để bán không
  for (let item of items) {
    const availableBins = await outboundModel.getAvailableBins(item.productId, item.quantity);

    if (availableBins.length < item.quantity) {
      throw new Error(`Không đủ hàng! Sản phẩm ID ${item.productId} chỉ còn ${availableBins.length} cái trong kho.`);
    }

    productDetails.push({
      productId: item.productId,
      quantity: item.quantity,
      bins: availableBins
    });
  }

  // BƯỚC 2: Tạo mã phiếu xuất (Ví dụ: PX-20260620-8888)
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const receiptCode = `PX-${dateString}-${randomNum}`;

  // BƯỚC 3: Ra lệnh cho Thủ kho xuất hàng
  await outboundModel.executeOutbound(userId, receiptCode, productDetails);
  
  return { receiptCode, details: productDetails };
};

module.exports = { createOutboundReceipt };