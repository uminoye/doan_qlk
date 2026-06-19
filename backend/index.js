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
        role: user.role,
        level: user.level // Thêm dòng này để Frontend lấy được cấp bậc
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
  }
});

// ==========================================
// API QUẢN LÝ SẢN PHẨM (KHO)
// ==========================================

// 1. API Thêm mới sản phẩm (Tự động sinh mã SKU)
app.post('/api/products', async (req, res) => {
  try {
    // Rút trích các thông tin người dùng gửi lên
    const { 
      name, category_code, brand_code, size_or_capacity, 
      type_detail, unit, sale_price, image_url 
    } = req.body;

    // Bước 1: Tạo phần đầu của mã SKU (Ví dụ: TV-SN-55)
    // Nếu không có kích thước thì bỏ trống phần đó
    let skuPrefix = `${category_code}-${brand_code}`;
    if (size_or_capacity) {
      skuPrefix += `-${size_or_capacity}`;
    }

    // Bước 2: Đếm xem trong Database đã có bao nhiêu sản phẩm có cái đầu SKU giống thế này
    // Dấu % ở cuối nghĩa là tìm tất cả những thằng bắt đầu bằng skuPrefix
    const countQuery = await db.query(
      `SELECT COUNT(*) FROM products WHERE sku LIKE $1`,
      [`${skuPrefix}%`]
    );
    
    // Tính số thứ tự tiếp theo
    const currentCount = parseInt(countQuery.rows[0].count);
    const nextNumber = currentCount + 1;

    // Bước 3: Độn thêm số 0 vào cho đủ 3 chữ số (VD: 1 -> 001, 12 -> 012)
    const sequenceString = nextNumber.toString().padStart(3, '0');

    // Bước 4: Chốt hạ mã SKU hoàn chỉnh (Ví dụ: TV-SN-55-001)
    const finalSKU = `${skuPrefix}-${sequenceString}`;

    // Bước 5: Lưu tất cả vào Database
    const insertQuery = `
      INSERT INTO products (sku, name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [finalSKU, name, category_code, brand_code, size_or_capacity, type_detail, unit, sale_price, image_url];
    
    const newProduct = await db.query(insertQuery, values);

    // Trả báo cáo thành công về cho Frontend
    res.json({
      success: true,
      message: '🎉 Đã thêm sản phẩm thành công!',
      product: newProduct.rows[0]
    });

  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm sản phẩm!' });
  }
});

// 2. API Lấy danh sách toàn bộ sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    // Sắp xếp theo ID giảm dần (Sản phẩm mới thêm sẽ nằm trên cùng)
    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Bắt đầu chạy Backend tại cổng ${PORT}`);
  console.log(`=========================================`);
});