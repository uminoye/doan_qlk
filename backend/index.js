require('dotenv').config();
const db = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();

// Cấu hình bảo mật và đọc dữ liệu
app.use(cors());
app.use(express.json());

// API test thử xem máy chủ có hoạt động không
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success',
    message: '🚀 Máy chủ Backend Quản lý kho đang chạy ngon lành!' 
  });
});

// Bật server tại cổng 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Bắt đầu chạy Backend tại cổng ${PORT}`);
  console.log(`👉 Link test: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});