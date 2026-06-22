const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./src/models/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Configuration
const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

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

const customerRoutes = require('./src/routes/customerRoutes');
app.use('/api/customers', customerRoutes);

const salesRoutes = require('./src/routes/salesRoutes');
app.use('/api/sales', salesRoutes);

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Development APIs
app.get('/api/setup', async (req, res) => {
  try {
    const hash = await bcrypt.hash('123456', 10);
    // Update default password for all users
    await db.query("UPDATE users SET password_hash = $1", [hash]);
    res.send(`<h2>✅ Cập nhật mật khẩu hệ thống thành công.</h2><p>Mã băm: ${hash}</p>`);
  } catch (error) {
    res.status(500).send('❌ Lỗi hệ thống: ' + error.message);
  }
});

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
      process.env.JWT_SECRET || 'DoAn_WMS_Secret_2026',
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
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`=========================================`);
});