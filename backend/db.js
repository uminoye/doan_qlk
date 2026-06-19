const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Bắt buộc khi dùng Database trên mây
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Lỗi kết nối Database:', err.stack);
  } else {
    console.log('✅ Đã kết nối thành công với Database trên Đám mây!');
  }
  if (client) release(); // Trả lại kết nối cho hệ thống
});

module.exports = pool;