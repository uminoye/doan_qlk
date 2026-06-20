const inboundModel = require('../models/inboundModel');

const createInboundReceipt = async (userId, items) => {
  let productDetails = [];

  // BƯỚC 1: Kiểm tra sức chứa trước khi cho xe tải vào kho
  for (let item of items) {
    const product = await inboundModel.getProductInfo(item.productId);
    if (!product) throw new Error(`Không tìm thấy sản phẩm ID ${item.productId}`);

    const zoneCode = `${product.category_code}-${product.brand_code}`;
    const emptyBins = await inboundModel.getEmptyBins(zoneCode, item.quantity);

    // Nếu số Bin trống ít hơn số hàng mang tới -> Đuổi về!
    if (emptyBins.length < item.quantity) {
      throw new Error(`Khu vực ${zoneCode} bị đầy! Chỉ còn ${emptyBins.length} vị trí trống, không đủ chứa ${item.quantity} sản phẩm!`);
    }

    productDetails.push({
      productId: item.productId,
      quantity: item.quantity,
      bins: emptyBins // Danh sách các Bin sẽ được dùng để cất hàng
    });
  }

  // BƯỚC 2: Tạo mã phiếu tự động (VD: PN-20260620-1234)
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const receiptCode = `PN-${dateString}-${randomNum}`;

  // BƯỚC 3: Ra lệnh cho Thủ kho lưu dữ liệu
  await inboundModel.executeInbound(userId, receiptCode, productDetails);
  
  return { receiptCode, details: productDetails };
};

module.exports = { createInboundReceipt };