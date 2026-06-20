const db = require('./db');

const getInventoryList = async () => {
  const query = `
    SELECT 
      p.sku AS "Ma_San_Pham", 
      p.name AS "Ten_San_Pham", 
      COUNT(l.id) AS "So_Luong_Ton",
      json_agg(l.location_code) AS "Danh_Sach_Bin"
    FROM locations l
    JOIN products p ON l.product_id = p.id
    WHERE l.status = 'FULL'
    GROUP BY p.id, p.sku, p.name;
  `;
  const result = await db.query(query);
  return result.rows;
};

module.exports = { getInventoryList };