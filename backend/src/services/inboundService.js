const inboundModel = require('../models/inboundModel');

// ============================================
// NGHIỆP VỤ TẠO PHIẾU NHẬP KHO
// ============================================

/**
 * Tạo phiếu nhập kho mới
 * @param {number} userId - ID người tạo phiếu
 * @param {Array} items - Danh sách sản phẩm: [{ productId, quantity }]
 * @returns {Object} Thông tin phiếu nhập
 */
const createInboundReceipt = async (userId, items) => {
  // Bước 1: Validate dữ liệu đầu vào
  if (!items || items.length === 0) {
    throw new Error('Danh sách sản phẩm trống!');
  }

  // Bước 2: Xử lý từng sản phẩm - gợi ý vị trí
  const processedItems = [];
  
  for (let item of items) {
    // Lấy thông tin sản phẩm
    const product = await inboundModel.getProductInfo(item.productId);
    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm ID ${item.productId}`);
    }

    // Xác định Zone dựa trên category và brand
    const zoneCode = `${product.category_code}-${product.brand_code}`;
    
    // Tự động gợi ý các Bin trống
    const emptyBins = await inboundModel.getEmptyBinsByZone(zoneCode, item.quantity);
    
    // Kiểm tra đủ vị trí không
    if (emptyBins.length < item.quantity) {
      const available = emptyBins.length;
      throw new Error(
        `Khu vực "${zoneCode}" (${product.category_code === 'TV' ? 'Tivi' : 
          product.category_code === 'TL' ? 'Tủ lạnh' : 
          product.category_code === 'MG' ? 'Máy giặt' : 'Máy lạnh'} ${product.brand_code}) ` +
        `chỉ còn ${available} vị trí trống, không đủ cho ${item.quantity} sản phẩm!`
      );
    }

    processedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      suggestedBins: emptyBins,
      zoneCode: zoneCode,
      productName: product.name,
      sku: product.sku
    });
  }

  // Bước 3: Tạo mã phiếu nhập tự động
  const receiptCode = await inboundModel.generateReceiptCode();

  // Bước 4: Tạo phiếu nhập trong database
  const receiptId = await inboundModel.createInboundReceipt(receiptCode, userId);

  // Bước 5: Xử lý từng sản phẩm - lưu chi tiết + cập nhật inventory
  const receiptDetails = [];
  
  for (let item of processedItems) {
    for (let i = 0; i < item.quantity; i++) {
      const bin = item.suggestedBins[i];
      
      // Lưu chi tiết phiếu nhập
      await inboundModel.addInboundDetail(receiptId, item.productId, bin.id, 1);
      
      // Cập nhật trạng thái Bin: ĐÁNH DẤU ĐẦY
      await inboundModel.occupyBin(bin.id, item.productId, 1);
      
      // Cập nhật tồn kho tổng (warehouse_id = 1 là kho mặc định)
      await inboundModel.updateInventory(item.productId, 1, 1);
      
      receiptDetails.push({
        sku: item.sku,
        productName: item.productName,
        locationCode: bin.location_code,
        quantity: 1,
        zoneCode: item.zoneCode
      });
    }
  }

  return {
    receiptId,
    receiptCode,
    totalProducts: items.reduce((sum, i) => sum + i.quantity, 0),
    totalItems: processedItems.length,
    details: receiptDetails,
    createdAt: new Date()
  };
};

// ============================================
// NGHIỆP VỤ GỢI Ý VỊ TRÍ BIN
// ============================================

/**
 * Gợi ý vị trí Bin trống tối ưu cho một sản phẩm
 * @param {number} productId - ID sản phẩm
 * @param {number} quantity - Số lượng cần nhập
 * @returns {Object} Thông tin gợi ý
 */
const suggestBinLocations = async (productId, quantity) => {
  const product = await inboundModel.getProductInfo(productId);
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm');
  }

  const zoneCode = `${product.category_code}-${product.brand_code}`;
  const emptyBins = await inboundModel.getEmptyBinsByZone(zoneCode, quantity);

  if (emptyBins.length < quantity) {
    return {
      success: false,
      message: `Khu vực ${zoneCode} chỉ còn ${emptyBins.length} vị trí trống`,
      available: emptyBins.length,
      suggestedBins: emptyBins,
      zoneCode
    };
  }

  return {
    success: true,
    productId,
    productName: product.name,
    sku: product.sku,
    zoneCode,
    zoneName: getZoneName(zoneCode),
    quantity,
    suggestedBins: emptyBins.slice(0, quantity),
    message: `Gợi ý ${quantity} vị trí trong khu ${getZoneName(zoneCode)}`
  };
};

/**
 * Lấy tổng quan tình trạng các khu vực kho
 */
const getWarehouseOverview = async () => {
  const emptyBinCounts = await inboundModel.getEmptyBinCountByZone();

  // Định dạng kết quả theo category
  const overview = {
    TV: { name: 'Tivi', zones: {} },
    TL: { name: 'Tủ Lạnh', zones: {} },
    MG: { name: 'Máy Giặt', zones: {} },
    ML: { name: 'Máy Lạnh', zones: {} }
  };

  emptyBinCounts.forEach(row => {
    const [category, brand] = [row.zone_code.substring(0, 2), row.zone_code.substring(3)];
    if (overview[category]) {
      overview[category].zones[brand] = {
        zoneCode: row.zone_code,
        emptyCount: parseInt(row.empty_count),
        zoneName: getZoneName(row.zone_code)
      };
    }
  });

  return overview;
};

// ============================================
// NGHIỆP VỤ XEM & DUYỆT PHIẾU NHẬP
// ============================================

/**
 * Lấy danh sách phiếu nhập kho (có phân trang)
 */
const getInboundReceipts = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const receipts = await inboundModel.getAllInboundReceipts(limit, offset);
  const total = await inboundModel.countInboundReceipts();

  return {
    receipts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Lấy chi tiết một phiếu nhập
 */
const getReceiptDetails = async (receiptId) => {
  const receipt = await inboundModel.getInboundReceiptById(receiptId);
  if (!receipt) {
    throw new Error('Không tìm thấy phiếu nhập');
  }

  const details = await inboundModel.getInboundReceiptDetails(receiptId);

  // Nhóm chi tiết theo Zone để hiển thị đẹp hơn
  const groupedByZone = {};
  details.forEach(d => {
    if (!groupedByZone[d.zone_code]) {
      groupedByZone[d.zone_code] = {
        zoneCode: d.zone_code,
        zoneName: getZoneName(d.zone_code),
        items: [],
        totalQty: 0
      };
    }
    groupedByZone[d.zone_code].items.push(d);
    groupedByZone[d.zone_code].totalQty += d.quantity;
  });

  return {
    ...receipt,
    details,
    groupedByZone: Object.values(groupedByZone),
    totalProducts: details.reduce((sum, d) => sum + d.quantity, 0)
  };
};

/**
 * Duyệt/Từ chối phiếu nhập kho
 */
const approveReceipt = async (receiptId, action) => {
  const receipt = await inboundModel.getInboundReceiptById(receiptId);
  if (!receipt) {
    throw new Error('Không tìm thấy phiếu nhập');
  }

  if (receipt.status !== 'PENDING') {
    throw new Error(`Phiếu đang ở trạng thái "${receipt.status}", không thể duyệt!`);
  }

  const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
  await inboundModel.updateReceiptStatus(receiptId, newStatus);

  return {
    receiptId,
    receiptCode: receipt.receipt_code,
    newStatus,
    message: action === 'approve' 
      ? `Đã duyệt phiếu ${receipt.receipt_code}` 
      : `Đã từ chối phiếu ${receipt.receipt_code}`
  };
};

// ============================================
// HÀM HỖ TRỢ
// ============================================

/**
 * Chuyển Zone Code thành tên hiển thị
 */
const getZoneName = (zoneCode) => {
  const categoryNames = {
    'TV': 'Tivi',
    'TL': 'Tủ Lạnh',
    'MG': 'Máy Giặt',
    'ML': 'Máy Lạnh'
  };

  const brandNames = {
    'SN': 'Sony',
    'SS': 'Samsung',
    'LG': 'LG',
    'TC': 'TCL',
    'PNS': 'Panasonic',
    'AQ': 'Aqua',
    'TSB': 'Toshiba',
    'HTC': 'Hitachi',
    'EL': 'Electrolux',
    'DK': 'Daikin',
    'CP': 'Casper',
    'SP': 'Sharp'
  };

  const [cat, brand] = [zoneCode.substring(0, 2), zoneCode.substring(3)];
  return `${categoryNames[cat] || cat} ${brandNames[brand] || brand}`;
};

module.exports = {
  createInboundReceipt,
  suggestBinLocations,
  getWarehouseOverview,
  getInboundReceipts,
  getReceiptDetails,
  approveReceipt,
  getZoneName
};
