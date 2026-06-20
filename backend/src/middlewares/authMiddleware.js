const verifyManager = (req, res, next) => {
  // Đọc thông tin cấp bậc gửi kèm trong Headers
  const userLevel = req.headers['user-level'];
  
  if (userLevel !== 'MANAGER' && userLevel !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: '🚫 Cảnh báo: Chỉ Quản Lý (Manager) hoặc Admin mới có quyền duyệt lệnh này!' 
    });
  }
  
  // Nếu đúng là Manager, bác bảo vệ mở cổng cho đi tiếp (chạy vào Controller)
  next(); 
};

module.exports = { verifyManager };