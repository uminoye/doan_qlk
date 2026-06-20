const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    const newUser = await authService.registerUser(username, password, full_name, role);
    res.json({ success: true, message: `Tạo tài khoản thành công! Mã NV: ${newUser.employee_code}`, user: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await authService.loginUser(username, password);
    res.json({ success: true, message: 'Đăng nhập thành công!', data });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };