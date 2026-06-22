import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Eye, X, RefreshCw, ClipboardList, 
  Check, CheckCircle2, Trash2, DollarSign, User 
} from 'lucide-react';

const API_BASE = 'https://doan-qlk.onrender.com/api';

function Sales() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'list'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State form tạo đơn
  const [items, setItems] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [submitResult, setSubmitResult] = useState(null);
  
  // State modal chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const userString = localStorage.getItem('user');
  const currentUser = (userString && userString !== "undefined") ? JSON.parse(userString) : null;
  const userRole = currentUser?.role || '';
  const userLevel = currentUser?.level || '';
  
  // Kiểm tra quyền duyệt đơn (Admin hoặc Trưởng phòng Sale)
  const canApprove = userRole === 'ADMIN' || (userRole === 'SALES' && userLevel === 'MANAGER');

  const getAuthHeaders = () => {
    return { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    if (activeTab === 'list') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (e) { console.error(e); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
        if (data.data.length > 0) setCustomerId(data.data[0].id.toString());
      }
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sales`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchOrderDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sales/${id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setShowDetailModal(true);
      }
    } catch (e) { alert('Lỗi tải chi tiết đơn hàng!'); }
    finally { setLoading(false); }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'productId') {
      const prod = products.find(p => p.id === parseInt(value));
      newItems[index] = { ...newItems[index], productId: value, unitPrice: prod ? prod.sale_price : 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) return alert('Vui lòng chọn khách hàng!');
    if (items.length === 0) return alert('Vui lòng thêm ít nhất 1 sản phẩm!');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          sale_person_id: currentUser?.id,
          items: items.map(item => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice)
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitResult({ receiptCode: data.orderCode, totalProducts: items.length });
        setItems([]);
        setTimeout(() => {
          setActiveTab('list');
          setSubmitResult(null);
        }, 2000);
      } else alert(data.message);
    } catch (error) { alert('Lỗi máy chủ!'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (orderId) => {
    if (!confirm('Xác nhận duyệt đơn hàng này phát hành xuống bộ phận Kho vận?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sales/approve/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ manager_id: currentUser?.id })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchOrders();
        setShowDetailModal(false);
      } else alert(data.message);
    } catch (e) { alert('Lỗi duyệt đơn!'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header & Tabs điều hướng giống hệt bài cũ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: 'bold' }}>Quản lý Kinh doanh (Sales)</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Lập đơn xuất bán thiết bị điện máy</p>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setActiveTab('create')} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', background: activeTab === 'create' ? '#3b82f6' : 'transparent', color: activeTab === 'create' ? 'white' : '#64748b' }}>
            <Plus size={16} style={{ marginRight: '6px' }} /> Lập đơn mới
          </button>
          <button onClick={() => { setActiveTab('list'); }} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', background: activeTab === 'list' ? '#3b82f6' : 'transparent', color: activeTab === 'list' ? 'white' : '#64748b' }}>
            <ClipboardList size={16} style={{ marginRight: '6px' }} /> Danh sách đơn
          </button>
        </div>
      </div>

      {submitResult && (
        <div style={{ padding: '16px 20px', background: '#d1fae5', color: '#059669', borderRadius: '12px', marginBottom: '20px', border: '2px solid #10b981', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <CheckCircle2 size={24} />
          <div>
            <div style={{ fontWeight: 'bold' }}>Lập đơn hàng thành công!</div>
            <div>Mã đơn: <strong>{submitResult.receiptCode}</strong> đang gửi chờ sếp duyệt.</div>
          </div>
        </div>
      )}

      {/* Tab 1: Lập đơn mới */}
      {activeTab === 'create' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Chọn Đối Tác Khách Hàng *</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_code} - {c.name} ({c.phone})</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Danh mục sản phẩm bán</label>
                <button type="button" onClick={handleAddItem} style={{ padding: '8px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>+ Thêm hàng</button>
              </div>

              {items.length === 0 ? (
                <div style={{ padding: '40px', textFilter: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>Chưa chọn sản phẩm nào</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                      <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <option value="">-- Chọn điện máy --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                      </select>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }} />
                      <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} style={{ width: '130px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Đơn giá lẻ" />
                      <button type="button" onClick={() => handleRemoveItem(index)} style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><X size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={items.length === 0} style={{ width: '100%', padding: '14px', background: items.length === 0 ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Gửi Lên Đơn Hàng Chờ Duyệt</button>
          </div>

          <div style={{ flex: 1, background: '#0f172a', color: 'white', padding: '24px', borderRadius: '16px', height: 'fit-content' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#3b82f6', display: 'flex', gap: '6px' }}><DollarSign size={18}/>Tổng giá trị đơn hàng</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 'bold', color: '#34d399' }}>
              <span>TỔNG TIỀN:</span>
              <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Danh sách đơn hàng */}
      {activeTab === 'list' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ Đang tải danh sách đơn hàng...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Mã Đơn</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Khách Hàng</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Tổng Tiền</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Trạng Thái</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Chưa có đơn hàng nào</td></tr>
                  ) : orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px', fontWeight: 'bold' }}>{order.order_code}</td>
                      <td style={{ padding: '14px', color: '#334155' }}>{order.customer_name || 'Khách lẻ'}</td>
                      <td style={{ padding: '14px', fontWeight: 'bold', color: '#10b981' }}>{Number(order.total_amount).toLocaleString('vi-VN')} đ</td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: order.status === 'PENDING' ? '#fef3c7' : '#d1fae5', color: order.status === 'PENDING' ? '#d97706' : '#059669' }}>
                          {order.status === 'PENDING' ? 'Chờ duyệt' : 'Đã duyệt bán'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <button onClick={() => fetchOrderDetails(order.id)} style={{ padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', gap: '4px', alignItems: 'center' }}><Eye size={14}/> Chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '700px', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Chi tiết đơn hàng: {selectedOrder.order_code}</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ border: 'none', background: '#f1f5f9', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><X/></button>
            </div>

            <p><strong>Khách hàng:</strong> {selectedOrder.customer_name}</p>
            <p><strong>Nhân viên lập đơn:</strong> {selectedOrder.sale_person_name}</p>
            <p style={{ marginBottom: '16px' }}><strong>Trạng thái:</strong> {selectedOrder.status}</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '13px' }}>SKU</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '13px' }}>Tên Sản Phẩm</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '13px' }}>SL</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontSize: '13px' }}>Giá Bán</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{item.sku}</td>
                    <td style={{ padding: '8px', fontSize: '13px' }}>{item.product_name}</td>
                    <td style={{ padding: '8px', fontSize: '13px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px', fontSize: '13px', textAlign: 'right' }}>{Number(item.unit_price).toLocaleString('vi-VN')} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '18px', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
              <span>TỔNG TIỀN ĐƠN:</span>
              <span style={{ color: '#10b981' }}>{Number(selectedOrder.total_amount).toLocaleString('vi-VN')} đ</span>
            </div>

            {canApprove && selectedOrder.status === 'PENDING' && (
              <button onClick={() => handleApprove(selectedOrder.id)} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}>✓ Sếp Phê Duyệt Đơn Hàng Này</button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <RefreshCw size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Sales;