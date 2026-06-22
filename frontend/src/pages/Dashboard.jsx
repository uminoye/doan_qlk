import { useState } from 'react';

function Dashboard() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Hàm gọi API xây kho tự động
  const generateBins = async () => {
    setLoading(true);
    setMessage('⏳ Đang nhờ thợ xây dựng 3000 vị trí kệ kho, chờ xíu nha...');
    
    try {
      const response = await fetch('https://doan-qlk.onrender.com/api/locations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ ' + data.message);
      } else {
        setMessage('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối đến máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#176b52' }}>📊 Màn hình Tổng quan</h1>
      <p>Chào mừng bạn đã bơi được vào bên trong hệ thống!</p>

      {/* Khu vực nút bấm Setup */}
      <div style={{ marginTop: '50px', padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', display: 'inline-block', maxWidth: '500px' }}>
        <h3 style={{ marginTop: 0 }}>🛠️ Cài đặt hệ thống ban đầu</h3>
        <p style={{ fontSize: '15px', color: '#555' }}>
          Hệ thống hiện tại chưa có vị trí lưu trữ. Hãy bấm nút dưới đây để móng tự động đổ và sinh ra gần 3000 Kệ Kho (Bin).
        </p>
        <p style={{ color: 'red', fontSize: '13px', fontStyle: 'italic' }}>
          (Lưu ý: Chỉ cần bấm 1 lần duy nhất!)
        </p>
        
        <button 
          onClick={generateBins} 
          disabled={loading}
          style={{ 
            marginTop: '10px',
            padding: '12px 24px', 
            backgroundColor: loading ? '#ccc' : '#176b52', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? 'Đang xây kho...' : '🚀 Xây dựng 3000 vị trí Bin ngay!'}
        </button>

        {/* Nơi hiển thị thông báo kết quả */}
        {message && (
          <p style={{ 
            marginTop: '20px', 
            fontWeight: 'bold', 
            color: message.includes('✅') ? 'green' : (message.includes('⏳') ? '#d48806' : 'red') 
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;