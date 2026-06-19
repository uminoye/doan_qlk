import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Bổ sung công cụ chuyển trang

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate(); // Khởi tạo công cụ

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 1. Lưu "thẻ ra vào" (token) và thông tin user vào bộ nhớ trình duyệt
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 2. Chuyển hướng thẳng vào trang Tổng quan
        navigate('/');
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Lỗi không kết nối được Backend!');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#176b52' }}>Hệ Thống Quản Lý Kho</h2>
      <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Tài khoản:</label><br/>
          <input 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            style={{ width: '250px', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Mật khẩu:</label><br/>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '250px', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#176b52', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Đăng Nhập
        </button>
      </form>
      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>
    </div>
  );
}

export default Login;