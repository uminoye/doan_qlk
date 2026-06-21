import { useState, useEffect } from 'react';

function Warehouse() {
  // Biến lưu trữ danh sách hàng hóa lấy từ Backend
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hàm gọi API lấy dữ liệu
  const fetchInventory = async () => {
    try {
      // Lấy thẻ bài (token) từ bộ nhớ ra
      const token = localStorage.getItem('token');

      // Gửi yêu cầu đến phòng Kho của Backend
      const response = await fetch('https://doan-qlk.onrender.com/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // ĐÂY LÀ ĐIỂM QUAN TRỌNG NHẤT: Trình thẻ bài ra cho bảo vệ (Middleware) xem
          'Authorization': `Bearer ${token}` 
        }
      });

      const data = await response.json();

      if (data.success) {
        setInventory(data.data); // Đổ dữ liệu lấy được vào biến inventory
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('❌ Không thể kết nối đến máy chủ!');
    } finally {
      setLoading(false); // Dù thành công hay thất bại cũng tắt hiệu ứng chờ
    }
  };

  // useEffect giúp tự động chạy hàm fetchInventory ngay khi vừa mở trang này lên
  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#176b52' }}>📦 Quản lý Tồn Kho</h2>
      
      {loading && <p>⏳ Đang tải dữ liệu từ kho...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Vẽ bảng hiển thị dữ liệu */}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#001529', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Mã Hàng (SKU)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên Sản Phẩm</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tồn Kho</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Vị Trí (Bin)</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Kho đang trống, chưa có hàng hóa nào!</td>
              </tr>
            ) : (
              inventory.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>{item.Ma_San_Pham}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item.Ten_San_Pham}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', color: '#176b52', fontWeight: 'bold' }}>{item.So_Luong_Ton}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {/* Danh_Sach_Bin trả về là mảng, nên mình join nó lại thành chuỗi cách nhau bằng dấu phẩy */}
                    {item.Danh_Sach_Bin?.join(', ')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Warehouse;