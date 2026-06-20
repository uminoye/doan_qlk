const factoryModel = require('../models/factoryModel');

const requestShipment = async (factoryManagerId, items) => {
  // Tạo mã lệnh (VD: NM-20260620-5555)
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const shipmentCode = `NM-${dateString}-${randomNum}`;

  await factoryModel.createShipment(shipmentCode, factoryManagerId, items);
  return shipmentCode;
};

const authorizeShipment = async (shipmentId, warehouseManagerId) => {
  return await factoryModel.approveShipment(shipmentId, warehouseManagerId);
};

const scanItem = async (shipmentId, sku) => {
  const product = await factoryModel.getProductBySKU(sku);
  if (!product) throw new Error('❌ Mã vạch tào lao!');

  // Tỷ lệ lỗi 10% (0.1)
  const isDefective = Math.random() < 0.1; 

  if (isDefective) {
    // Nếu bốc trúng hàng lỗi, chọn ngẫu nhiên 1 lý do
    const reasons = ['Móp méo vỏ hộp', 'Vỡ màn hình', 'Thiếu phụ kiện', 'Bật không lên nguồn'];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    
    await factoryModel.recordDefectiveItem(shipmentId, product.id, randomReason);
    
    return {
      status: 'DEFECTIVE',
      productName: product.name,
      reason: randomReason
    };
  } else {
    // Nếu hàng ngon (90%), thì cộng vào số hàng tốt (scanned_qty) như cũ
    const updatedDetail = await factoryModel.updateScannedQuantity(shipmentId, product.id);
    
    // 👇 THÊM 3 DÒNG BẢO VỆ NÀY VÀO 👇
    if (!updatedDetail) {
      throw new Error('❌ Mã Lệnh Giao Hàng (shipment_id) bị sai, hoặc sản phẩm này không có trong Lệnh!');
    }
    // 👆 THÊM XONG 👆

    if (updatedDetail.scanned_qty > updatedDetail.expected_qty) {
      throw new Error(`⚠️ CẢNH BÁO: Quét lố số lượng Nhà máy báo!`);
    }

    return {
      status: 'GOOD',
      productName: product.name,
      expected: updatedDetail.expected_qty,
      scanned: updatedDetail.scanned_qty
    };
  }
};



module.exports = { requestShipment, authorizeShipment, scanItem };