const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../services/authService');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header
  if (!token) return res.status(403).json({ message: "❌ Thiếu thẻ bài (Token)!" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Lưu thông tin người dùng vào request
    next();
  } catch (err) {
    res.status(401).json({ message: "❌ Thẻ bài không hợp lệ hoặc đã hết hạn!" });
  }
};

const verifyManager = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'MANAGER' || req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ message: "❌ Cút! Chức vụ thấp quá không được duyệt đơn!" });
    }
  });
};

/**
 * Middleware kiểm tra quyền theo danh sách roles
 * @param {string[]} allowedRoles - Mảng các role được phép
 */
const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    verifyToken(req, res, () => {
      if (allowedRoles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ 
          success: false,
          message: `❌ Không có quyền! Chỉ ${allowedRoles.join(', ')} mới được thực hiện thao tác này.` 
        });
      }
    });
  };
};

module.exports = { verifyToken, verifyManager, requireRoles };