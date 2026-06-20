const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Khai báo kết nối Database (đã cập nhật đường dẫn vào thư mục models)
const db = require('./src/models/db');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// NHÚNG CÁC ROUTER (PHÒNG TIẾP TÂN MỚI)
// ==========================================
// Gọi phòng Tiếp tân của Sản phẩm ra làm việc
const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

// Kéo Tiếp tân quản lý Kho ra làm việc
const locationRoutes = require('./src/routes/locationRoutes');
app.use('/api/locations', locationRoutes);

const inboundRoutes = require('./src/routes/inboundRoutes');
app.use('/api/inbound', inboundRoutes);

const inventoryRoutes = require('./src/routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

const outboundRoutes = require('./src/routes/outboundRoutes');
app.use('/api/outbound', outboundRoutes);

const factoryRoutes = require('./src/routes/factoryRoutes');
app.use('/api/factory', factoryRoutes);

// ==========================================
// API FIX MẬT KHẨU (Tạm thời để ở đây, mốt rảnh dời sau)
// ==========================================
app.get('/api/setup', async (req, res) => {
  try {
    const hash = await bcrypt.hash('123456', 10);
    await db.query("UPDATE users SET password_hash = $1 WHERE username = 'admin'", [hash]);
    res.send(`<h2>✅ Đã cập nhật lại mật khẩu admin thành: 123456</h2><p>Mã băm mới trong DB là: ${hash}</p>`);
  } catch (error) {
    res.send('❌ Lỗi: ' + error.message);
  }
});

// ==========================================
// API ĐĂNG NHẬP (Tạm thời để ở đây, mốt rảnh dời sau)
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        level: user.level
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
  }
});



// ==========================================
// KHỞI ĐỘNG MÁY CHỦ
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Bắt đầu chạy Backend tại cổng ${PORT}`);
  console.log(`=========================================`);
});