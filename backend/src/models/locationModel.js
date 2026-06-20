const db = require('./db');

const insertBulkLocations = async (locations) => {
  // Chuyển mảng dữ liệu thành chuỗi SQL
  const values = locations.map(loc => 
    `('${loc.code}', '${loc.zone}', ${loc.a}, ${loc.r}, ${loc.s}, ${loc.b})`
  ).join(', ');

  // ON CONFLICT DO NOTHING: Nếu chạy lại lần 2 mà mã Bin đã tồn tại thì bỏ qua, không báo lỗi
  const query = `
    INSERT INTO locations (location_code, zone_code, aisle, rack, shelf, bin) 
    VALUES ${values} 
    ON CONFLICT (location_code) DO NOTHING;
  `;
  
  await db.query(query);
};

module.exports = { insertBulkLocations };