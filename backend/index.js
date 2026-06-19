const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// API test thử
app.get('/api/setup', async (req, res) => {
  try {
    // Tự động mã hóa chữ '123456'
    const hash = await bcrypt.hash('123456', 10);
    
    // Cập nhật lại vào Database cho tài khoản admin
    await db.query("UPDATE users SET password_hash = $1 WHERE username = 'admin'", [hash]);
    
    res.send(`<h2>✅ Đã cập nhật lại mật khẩu admin thành: 123456</h2><p>Mã băm mới trong DB là: ${hash}</p>`);
  } catch (error) {
    res.send('❌ Lỗi: ' + error.message);
  }
});

// ==========================================
// API ĐĂNG NHẬP
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm user trong Database
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }

    const user = result.rows[0];

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }

    // 3. Tạo chìa khóa (Token)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Đăng nhập tồn tại 1 ngày
    );

    // 4. Trả kết quả về cho Frontend
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Bắt đầu chạy Backend tại cổng ${PORT}`);
  console.log(`=========================================`);
});