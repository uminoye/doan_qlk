import { useState, useEffect } from 'react';
import { UserPlus, Users, RefreshCw, MapPin, Phone, ShieldAlert } from 'lucide-react';

const API_BASE = 'https://doan-qlk.onrender.com/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const userString = localStorage.getItem('user');
  const currentUser = (userString && userString !== "undefined") ? JSON.parse(userString) : null;
  const userRole = currentUser?.role || '';
  const userLevel = currentUser?.level || '';

  // Chỉ cho phép ADMIN hoặc Trưởng phòng kinh doanh (SALES + MANAGER) vào mục này
  const isAuthorized = userRole === 'ADMIN' || (userRole === 'SALES' && userLevel === 'MANAGER');

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isAuthorized) fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setFormData({ name: '', phone: '', address: '' });
        fetchCustomers();
      } else alert(data.message);
    } catch (error) { alert('Lỗi hệ thống!'); }
    finally { setLoading(false); }
  };

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
        <ShieldAlert size={50} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
        <h3 style={{ color: '#1e293b' }}>Từ Chối Truy Cập</h3>
        <p style={{ color: '#64748b', marginTop: '6px' }}>Mục quản lý này chỉ dành riêng cho Admin và Trưởng phòng Sale hệ thống.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={24} color="#10b981" /> Quản lý Đối Tác Khách Hàng
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Thêm mới và tra cứu thông tin hệ thống khách sỉ thiết bị điện máy</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Bên Trái: Form thêm khách hàng */}
        <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}>
            <UserPlus size={18} color="#10b981" /> Đăng ký Khách hàng Mới
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Tên đối tác / Tên đại lý *</label>
              <input required name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="VD: Siêu thị Điện máy Chợ Lớn" />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Số điện thoại liên hệ *</label>
              <input required name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="VD: 0912345678" />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Địa chỉ công ty / Đại lý *</label>
              <input required name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="VD: Số 12 Đường Trần Hưng Đạo, Dĩ An, Bình Dương" />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}>
              {loading ? 'Đang lưu đối tác...' : '✓ Lưu Khách Hàng Khỏi Hệ Thống'}
            </button>
          </form>
        </div>

        {/* Bên Phải: Bảng danh sách khách hàng */}
        <div style={{ flex: 2, minWidth: '400px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>Danh sách khách sỉ ({customers.length})</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '13px', borderBottom: '2px solid #e2e8f0' }}>Mã Khách Hàng</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '13px', borderBottom: '2px solid #e2e8f0' }}>Tên Đối Tác</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '13px', borderBottom: '2px solid #e2e8f0' }}>Liên Hệ</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Chưa có đối tác nào trên hệ thống</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>{c.customer_code}</td>
                    <td style={{ padding: '12px', color: '#1e293b', fontWeight: '500' }}>{c.name}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12}/>{c.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><MapPin size={12}/>{c.address}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <RefreshCw size={40} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Customers;