const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');

// Con dấu xịn của công ty để đóng mộc lên Thẻ từ (JWT)
// Thực tế người ta giấu cái này đi, nhưng mình đang test nên để đây cho dễ
const SECRET_KEY = 'DoAn_WMS_Secret_2026'; 

const registerUser = async (username, password, fullName, role) => {
  const existingUser = await authModel.getUserByUsername(username);
  if (existingUser) throw new Error('❌ Tên đăng nhập này đã có người xài!');

  // Băm mật khẩu ra 10 mảnh
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Tự sinh mã Nhân viên y như em làm với khách hàng
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const employeeCode = `NV-${randomNum}`;

  return await authModel.createUser(username, passwordHash, fullName, role, employeeCode);
};

const loginUser = async (username, password) => {
  const user = await authModel.getUserByUsername(username);
  if (!user) throw new Error('❌ Không tìm thấy tài khoản này!');

  // Lấy mật khẩu nhập vào so sánh với mớ băm nát trong Database
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error('❌ Sai mật khẩu rồi em ơi!');

  // Đăng nhập thành công -> In thẻ từ (Token) có hạn dùng 8 tiếng
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.full_name },
    SECRET_KEY,
    { expiresIn: '8h' } 
  );
  
  return { 
    token, 
    userInfo: { id: user.id, name: user.full_name, role: user.role } 
  };
};

module.exports = { registerUser, loginUser, SECRET_KEY };