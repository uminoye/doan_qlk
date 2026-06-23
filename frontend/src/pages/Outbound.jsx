import { useState, useEffect } from 'react';
import { Truck, Plus, ClipboardList, CheckCircle2, RefreshCw, X, PackageOpen } from 'lucide-react';

// Hệ thống tự động quét xem trang web đang chạy ở đâu
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'               // Nếu chạy ở máy nhà -> Gọi Localhost
  : 'https://doan-qlk.onrender.com/api';      // Nếu chạy trên Vercel -> Gọi Render

function Outbound() {
  const [activeTab, setActiveTab] = useState('create');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [submitResult, setSubmitResult] = useState(null);

  const userString = localStorage.getItem('user');
  const currentUser = (userString && userString !== "undefined") ? JSON.parse(userString) : null;
  const userRole = currentUser?.role || '';
  const canCreate = userRole === 'ADMIN' || userRole === 'KHO' || userRole === 'SALES';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`, { headers: getAuthHeaders() });
      const data = await response.json();
      // Chỉ lấy những sản phẩm đang có tồn kho > 0 để hiển thị cho xuất
      if (data.success) {
        setProducts(data.products.filter(p => p.inventory > 0));
      }
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert('Vui lòng thêm ít nhất 1 sản phẩm cần xuất!');

    // Kiểm tra tính hợp lệ
    for (let item of items) {
      if (!item.productId) return alert('Vui lòng chọn sản phẩm!');
      if (!item.quantity || item.quantity <= 0) return alert('Số lượng xuất phải lớn hơn 0!');
      
      const productObj = products.find(p => p.id === parseInt(item.productId));
      if (productObj && item.quantity > productObj.inventory) {
        return alert(`Sản phẩm ${productObj.name} chỉ còn ${productObj.inventory} cái trong kho, không đủ để xuất ${item.quantity}!`);
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/outbound`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: currentUser?.id,
          items: items.map(item => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity)
          }))
        })
      });
      
      const data = await response.json();

      if (data.success) {
        setSubmitResult(data.data);
        setItems([]);
        fetchProducts(); // Tải lại để update số tồn kho mới
        setTimeout(() => setSubmitResult(null), 5000);
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      alert('Lỗi kết nối đến máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: 'bold' }}>Xuất Kho (Outbound)</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Quét và xuất hàng ra khỏi kệ Bin</p>
        </div>
      </div>

      {submitResult && (
        <div style={{ padding: '16px 20px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid #3b82f6' }}>
          <CheckCircle2 size={24} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Đã xuất kho thành công!</div>
            <div style={{ fontSize: '14px' }}>Mã phiếu xuất: <strong>{submitResult.receiptCode}</strong></div>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PackageOpen size={20} color="#f59e0b" /> Lập Phiếu Xuất Kho
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Sản phẩm cần xuất</label>
            <button 
              type="button" onClick={handleAddItem} disabled={!canCreate}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: canCreate ? '#f59e0b' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', cursor: canCreate ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px' }}
            >
              <Plus size={16} /> Thêm vào phiếu
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <Truck size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#64748b', margin: 0 }}>Chưa có sản phẩm nào cần xuất</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, index) => {
                const selectedProduct = products.find(p => p.id === parseInt(item.productId));
                return (
                  <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '32px', height: '32px', background: '#f59e0b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                      {index + 1}
                    </div>

                    <select 
                      value={item.productId} 
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      disabled={!canCreate}
                      style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    >
                      <option value="">-- Chọn sản phẩm có trong kho --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Tồn hiện tại: {p.inventory})
                        </option>
                      ))}
                    </select>

                    <input 
                      type="number" min="1" max={selectedProduct?.inventory || 999}
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      disabled={!canCreate}
                      style={{ width: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'center' }}
                      placeholder="SL xuất"
                    />

                    <button 
                      type="button" onClick={() => handleRemoveItem(index)} disabled={!canCreate}
                      style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: canCreate ? 'pointer' : 'not-allowed' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {canCreate && (
          <button 
            type="button" onClick={handleSubmit} disabled={loading || items.length === 0}
            style={{ width: '100%', padding: '14px', background: loading || items.length === 0 ? '#94a3b8' : '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</> : <><Truck size={18} /> Xác Nhận Xuất Kho</>}
          </button>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Outbound;