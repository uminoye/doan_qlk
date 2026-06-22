import { useState, useEffect } from 'react';
import { Package, MapPin, RefreshCw, Layers } from 'lucide-react';

function Warehouse() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://doan-qlk.onrender.com/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      const data = await response.json();

      if (data.success) {
        setInventory(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('❌ Không thể kết nối đến máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Tính tổng số lượng hàng trong kho
  const totalItems = inventory.reduce((sum, item) => sum + Number(item.So_Luong_Ton), 0);

  // Lọc sản phẩm theo ô tìm kiếm
  const filteredInventory = inventory.filter(item => 
    item.Ten_San_Pham.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.Ma_San_Pham.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Tiêu đề & Tổng quan */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={24} color="#10b981" /> Quản lý Tồn Kho Thực Tế
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Giám sát vị trí (Bin) và số lượng hàng hóa đang lưu trữ
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>TỔNG MẶT HÀNG</div>
            <div style={{ color: '#1e293b', fontSize: '20px', fontWeight: 'bold' }}>{inventory.length}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>TỔNG SẢN PHẨM</div>
            <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>{totalItems}</div>
          </div>
          <button onClick={fetchInventory} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', marginLeft: '10px' }} title="Làm mới">
            <RefreshCw size={18} color="#475569" />
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <input 
          type="text" 
          placeholder="🔍 Tìm kiếm theo Tên sản phẩm hoặc Mã SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Thông báo trạng thái */}
      {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>⏳ Đang kiểm kê lại kho, em đợi chút nhé...</p>}
      {error && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

      {/* Bảng dữ liệu chuyên nghiệp */}
      {!loading && !error && (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#475569', borderBottom: '1px solid #e2e8f0', width: '20%' }}>MÃ HÀNG (SKU)</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#475569', borderBottom: '1px solid #e2e8f0', width: '30%' }}>TÊN SẢN PHẨM</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#475569', borderBottom: '1px solid #e2e8f0', width: '15%' }}>TỒN KHO THỰC</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#475569', borderBottom: '1px solid #e2e8f0', width: '35%' }}>VỊ TRÍ LƯU TRỮ (BIN)</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <Package size={48} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
                    Kho đang trống hoặc không tìm thấy sản phẩm này!
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>
                      {item.Ma_San_Pham}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                      {item.Ten_San_Pham}
                    </td>
                    <td style={{ padding: '16px', fontSize: '16px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>
                      {item.So_Luong_Ton}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.Danh_Sach_Bin && item.Danh_Sach_Bin.map((bin, idx) => (
                          <span key={idx} style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {bin}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Warehouse;