import { useState, useEffect } from 'react';
import { 
  Package, Plus, Eye, X, MapPin, RefreshCw,
  ClipboardList, Check, CheckCircle2
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'               // Nếu chạy ở máy nhà -> Gọi Localhost
  : 'https://doan-qlk.onrender.com/api';      // Nếu chạy trên Vercel -> Gọi Render

// Mapping Zone Code -> Tên hiển thị
const zoneConfig = {
  'TV-SN': 'Tivi Sony',
  'TV-SS': 'Tivi Samsung',
  'TV-LG': 'Tivi LG',
  'TV-TCL': 'Tivi TCL',
  'TL-PNS': 'Tủ Lạnh Panasonic',
  'TL-AQ': 'Tủ Lạnh Aqua',
  'TL-TSB': 'Tủ Lạnh Toshiba',
  'TL-HTC': 'Tủ Lạnh Hitachi',
  'MG-EL': 'Máy Giặt Electrolux',
  'MG-LG': 'Máy Giặt LG',
  'MG-TSB': 'Máy Giặt Toshiba',
  'MG-AQ': 'Máy Giặt Aqua',
  'ML-DK': 'Máy Lạnh Daikin',
  'ML-PNS': 'Máy Lạnh Panasonic',
  'ML-CP': 'Máy Lạnh Casper',
  'ML-SP': 'Máy Lạnh Sharp'
};

function Inbound() {
  // ============================================
  // STATE QUẢN LÝ
  // ============================================
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'list'
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warehouseOverview, setWarehouseOverview] = useState(null);
  
  // State cho form tạo phiếu
  const [items, setItems] = useState([]);
  const [suggestedBins, setSuggestedBins] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  
  // State cho modal chi tiết
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReceipts, setTotalReceipts] = useState(0);

  // ============================================
  // AUTHORIZATION
  // ============================================
  const userString = localStorage.getItem('user');
  const currentUser = (userString && userString !== "undefined") ? JSON.parse(userString) : null;
  const userRole = currentUser?.role || '';
  const canCreate = userRole === 'ADMIN' || userRole === 'KHO';
  const canApprove = userRole === 'ADMIN' || userRole === 'KHO';

  // ============================================
  // HELPER: GỌI API
  // ============================================
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const apiCall = async (url, options = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers }
    });
    return response.json();
  };

  // ============================================
  // LOAD DATA KHI MOUNT
  // ============================================
  useEffect(() => {
    fetchProducts();
    fetchWarehouseOverview();
    if (activeTab === 'list') {
      fetchReceipts();
    }
  }, [activeTab, page]);

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  const fetchProducts = async () => {
    try {
      const data = await apiCall('/products');
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchWarehouseOverview = async () => {
    try {
      const data = await apiCall('/inbound/warehouse-overview');
      if (data.success) setWarehouseOverview(data.data);
    } catch (error) {
      console.error('Error fetching warehouse overview:', error);
    }
  };

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/inbound?page=${page}&limit=10`);
      if (data.success) {
        setReceipts(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalReceipts(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptDetails = async (receiptId) => {
    setLoading(true);
    try {
      const data = await apiCall(`/inbound/${receiptId}`);
      if (data.success) {
        setSelectedReceipt(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      alert('Lỗi khi tải chi tiết phiếu!');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // XỬ LÝ THÊM/SỬA/XÓA SẢN PHẨM TRONG PHIẾU
  // ============================================
  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, suggestedBin: null }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setSuggestedBins(null);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    
    // Reset suggested bins khi đổi sản phẩm
    if (field === 'productId') {
      setSuggestedBins(null);
    }
  };

  // ============================================
  // GỢI Ý VỊ TRÍ BIN
  // ============================================
  const handleSuggestBins = async (itemIndex) => {
    const item = items[itemIndex];
    if (!item.productId || !item.quantity) {
      alert('Vui lòng chọn sản phẩm và nhập số lượng!');
      return;
    }

    try {
      const data = await apiCall('/inbound/suggest-bins', {
        method: 'POST',
        body: JSON.stringify({ product_id: parseInt(item.productId), quantity: parseInt(item.quantity) })
      });

      if (data.success) {
        setSuggestedBins(data.data);
      } else {
        alert(data.message || 'Không tìm thấy vị trí phù hợp!');
      }
    } catch (error) {
      alert('Lỗi khi gợi ý vị trí!');
    }
  };

  // ============================================
  // SUBMIT PHIẾU NHẬP KHO
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm!');
      return;
    }

    // Validate
    for (let item of items) {
      if (!item.productId) {
        alert('Vui lòng chọn sản phẩm cho tất cả các dòng!');
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        alert('Số lượng phải lớn hơn 0!');
        return;
      }
    }

    setLoading(true);
    try {
      const data = await apiCall('/inbound', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(item => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity)
          }))
        })
      });

      if (data.success) {
        setSubmitResult(data.data);
        // Reset form
        setItems([]);
        setSuggestedBins(null);
        // Refresh data
        fetchWarehouseOverview();
        fetchReceipts();
        // Chuyển sang tab danh sách sau 2 giây
        setTimeout(() => {
          setActiveTab('list');
          setSubmitResult(null);
        }, 2000);
      } else {
        alert(data.message || 'Lỗi khi tạo phiếu nhập!');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DUYỆT PHIẾU NHẬP
  // ============================================
  const handleApprove = async (receiptId, action) => {
    if (!confirm(`Xác nhận ${action === 'approve' ? 'duyệt' : 'từ chối'} phiếu nhập này?`)) return;
    
    setLoading(true);
    try {
      const data = await apiCall(`/inbound/${receiptId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ action })
      });

      if (data.success) {
        alert(data.message);
        fetchReceipts();
        setShowDetailModal(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Lỗi khi duyệt phiếu!');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER: TAB TẠO PHIẾU NHẬP
  // ============================================
  const renderCreateTab = () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Form nhập kho */}
      <div style={{ flex: 2 }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="#10b981" /> Tạo Phiếu Nhập Kho Mới
          </h3>

          {/* Danh sách sản phẩm */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Danh sách sản phẩm</label>
              <button 
                type="button"
                onClick={handleAddItem}
                disabled={!canCreate}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                  background: canCreate ? '#10b981' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px',
                  cursor: canCreate ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px'
                }}
              >
                <Plus size={16} /> Thêm sản phẩm
              </button>
            </div>

            {items.length === 0 ? (
              <div style={{ 
                padding: '40px', textAlign: 'center', background: '#f8fafc', 
                borderRadius: '12px', border: '2px dashed #e2e8f0'
              }}>
                <Package size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#64748b', margin: 0 }}>Chưa có sản phẩm nào</p>
                <p style={{ color: '#94a3b8', margin: '8px 0 0 0', fontSize: '13px' }}>Nhấn "Thêm sản phẩm" để bắt đầu</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', gap: '12px', alignItems: 'center',
                    padding: '16px', background: '#f8fafc', borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {/* Số thứ tự */}
                    <div style={{ 
                      width: '32px', height: '32px', background: '#10b981', color: 'white',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '14px', flexShrink: 0
                    }}>
                      {index + 1}
                    </div>

                    {/* Chọn sản phẩm */}
                    <select 
                      value={item.productId} 
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      disabled={!canCreate}
                      style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} ({p.category_code})
                        </option>
                      ))}
                    </select>

                    {/* Số lượng */}
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      disabled={!canCreate}
                      style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'center' }}
                      placeholder="SL"
                    />

                    {/* Nút gợi ý */}
                    <button 
                      type="button"
                      onClick={() => handleSuggestBins(index)}
                      disabled={!canCreate}
                      style={{ 
                        padding: '10px 14px', background: canCreate ? '#3b82f6' : '#94a3b8', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: canCreate ? 'pointer' : 'not-allowed', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                      }}
                    >
                      <MapPin size={14} /> Gợi ý Bin
                    </button>

                    {/* Nút xóa */}
                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={!canCreate}
                      style={{ 
                        padding: '10px', background: '#fee2e2', color: '#ef4444',
                        border: 'none', borderRadius: '8px', cursor: canCreate ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gợi ý vị trí Bin */}
          {suggestedBins && (
            <div style={{ 
              marginBottom: '20px', padding: '20px', background: '#ecfdf5', 
              borderRadius: '12px', border: '2px solid #10b981'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} /> Vị trí Bin được gợi ý
              </h4>
              <p style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '13px' }}>
                <strong>{suggestedBins.zoneName}</strong> - {suggestedBins.quantity} vị trí trống
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestedBins.suggestedBins?.map((bin, idx) => (
                  <div key={idx} style={{ 
                    padding: '8px 12px', background: 'white', borderRadius: '6px',
                    fontSize: '12px', fontWeight: 'bold', color: '#1e293b',
                    border: '1px solid #10b981'
                  }}>
                    {bin.location_code}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nút Submit */}
          {canCreate && (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              style={{ 
                width: '100%', padding: '14px', background: loading || items.length === 0 ? '#94a3b8' : '#10b981',
                color: 'white', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check size={18} /> Lưu Phiếu Nhập Kho
                </>
              )}
            </button>
          )}

          {!canCreate && (
            <div style={{ 
              padding: '16px', background: '#fef3c7', borderRadius: '10px',
              color: '#92400e', textAlign: 'center', fontSize: '14px'
            }}>
              Bạn không có quyền tạo phiếu nhập kho. Liên hệ Quản lý Kho để được hỗ trợ.
            </div>
          )}
        </div>
      </div>

      {/* Tổng quan kho */}
      <div style={{ flex: 1 }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
            Tình trạng kho hàng
          </h3>
          
          {warehouseOverview ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(warehouseOverview).map(([catKey, catData]) => (
                <div key={catKey}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                    {catData.name}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {Object.entries(catData.zones).map(([brandKey, zoneData]) => (
                      <div key={brandKey} style={{ 
                        padding: '10px', background: '#f8fafc', borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                          {zoneData.zoneCode}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: zoneData.emptyCount > 10 ? '#10b981' : zoneData.emptyCount > 0 ? '#f59e0b' : '#ef4444' }}>
                          {zoneData.emptyCount}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>vị trí trống</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
              Đang tải...
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: TAB DANH SÁCH PHIẾU NHẬP
  // ============================================
  const renderListTab = () => (
    <div>
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} color="#3b82f6" /> Danh sách Phiếu Nhập Kho
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
            Tổng: <strong>{totalReceipts}</strong> phiếu
          </div>
        </div>

        {/* Bảng danh sách */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0' }}>Mã Phiếu</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0' }}>Ngày tạo</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0' }}>Người tạo</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0' }}>Trạng thái</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Chưa có phiếu nhập kho nào
                  </td>
                </tr>
              ) : receipts.map((receipt) => (
                <tr key={receipt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                    {receipt.receipt_code}
                  </td>
                  <td style={{ padding: '14px', color: '#64748b', fontSize: '14px' }}>
                    {new Date(receipt.created_at).toLocaleDateString('vi-VN', { 
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '14px', color: '#64748b', fontSize: '14px' }}>
                    {receipt.user_name || 'N/A'}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      background: receipt.status === 'PENDING' ? '#fef3c7' : receipt.status === 'APPROVED' ? '#d1fae5' : '#fee2e2',
                      color: receipt.status === 'PENDING' ? '#d97706' : receipt.status === 'APPROVED' ? '#059669' : '#ef4444'
                    }}>
                      {receipt.status === 'PENDING' ? 'Chờ duyệt' : receipt.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <button 
                      onClick={() => fetchReceiptDetails(receipt.id)}
                      style={{ 
                        padding: '8px 12px', background: '#eff6ff', color: '#1d4ed8',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <Eye size={14} /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '8px 16px', background: page === 1 ? '#f1f5f9' : 'white', color: page === 1 ? '#94a3b8' : '#334155', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Trước
            </button>
            <span style={{ padding: '8px 16px', color: '#64748b', fontSize: '14px' }}>
              Trang {page} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '8px 16px', background: page === totalPages ? '#f1f5f9' : 'white', color: page === totalPages ? '#94a3b8' : '#334155', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER: MODAL CHI TIẾT PHIẾU NHẬP
  // ============================================
  const renderDetailModal = () => {
    if (!selectedReceipt) return null;
    
    return (
      <div style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
      }}>
        <div style={{ 
          background: 'white', borderRadius: '16px', width: '800px', maxHeight: '90vh', 
          overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', top: 0, background: 'white', zIndex: 1
          }}>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 'bold' }}>
                Chi tiết Phiếu Nhập: {selectedReceipt.receipt_code}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                Ngày tạo: {new Date(selectedReceipt.created_at).toLocaleDateString('vi-VN', { 
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <button 
              onClick={() => setShowDetailModal(false)}
              style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              <X size={20} color="#64748b" />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {/* Thông tin chung */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Người tạo</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{selectedReceipt.user_name || 'N/A'}</div>
              </div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Trạng thái</div>
                <div style={{ fontWeight: 'bold', color: selectedReceipt.status === 'APPROVED' ? '#059669' : selectedReceipt.status === 'REJECTED' ? '#ef4444' : '#d97706' }}>
                  {selectedReceipt.status === 'PENDING' ? 'Chờ duyệt' : selectedReceipt.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Tổng sản phẩm</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{selectedReceipt.totalProducts}</div>
              </div>
            </div>

            {/* Danh sách sản phẩm theo khu vực */}
            <h4 style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '14px', fontWeight: 'bold' }}>
              Chi tiết sản phẩm ({selectedReceipt.totalProducts} sản phẩm)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedReceipt.groupedByZone?.map((zone) => (
                <div key={zone.zoneCode} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ 
                    padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{zone.zoneName}</span>
                      <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '8px' }}>({zone.totalQty} sản phẩm)</span>
                    </div>
                    <span style={{ padding: '4px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {zone.zoneCode}
                    </span>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'transparent' }}>
                          <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>SKU</th>
                          <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Sản phẩm</th>
                          <th style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>SL</th>
                          <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Vị trí</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zone.items.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: idx < zone.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <td style={{ padding: '8px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{item.sku}</td>
                            <td style={{ padding: '8px 0', fontSize: '13px', color: '#64748b' }}>{item.productName}</td>
                            <td style={{ padding: '8px 0', fontSize: '13px', color: '#1e293b', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                            <td style={{ padding: '8px 0', fontSize: '12px', color: '#10b981', fontFamily: 'monospace' }}>{item.locationCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {canApprove && selectedReceipt.status === 'PENDING' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  onClick={() => handleApprove(selectedReceipt.id, 'reject')}
                  style={{ 
                    padding: '12px 24px', background: '#fee2e2', color: '#ef4444',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <X size={16} /> Từ chối
                </button>
                <button 
                  onClick={() => handleApprove(selectedReceipt.id, 'approve')}
                  style={{ 
                    padding: '12px 24px', background: '#10b981', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <Check size={16} /> Duyệt phiếu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={{ padding: '24px', fontFamily: 'Arial', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: 'bold' }}>Nhập Kho (Inbound)</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Quản lý phiếu nhập kho và vị trí lưu trữ</p>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button 
            onClick={() => setActiveTab('create')}
            disabled={!canCreate}
            style={{ 
              padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: canCreate ? 'pointer' : 'not-allowed',
              fontWeight: 'bold', fontSize: '13px',
              background: activeTab === 'create' ? '#10b981' : 'transparent',
              color: activeTab === 'create' ? 'white' : canCreate ? '#64748b' : '#94a3b8'
            }}
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            Tạo phiếu mới
          </button>
          <button 
            onClick={() => { setActiveTab('list'); fetchReceipts(); }}
            style={{ 
              padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '13px',
              background: activeTab === 'list' ? '#10b981' : 'transparent',
              color: activeTab === 'list' ? 'white' : '#64748b'
            }}
          >
            <ClipboardList size={16} style={{ marginRight: '6px' }} />
            Danh sách phiếu
          </button>
        </div>
      </div>

      {/* Success Message */}
      {submitResult && (
        <div style={{ 
          padding: '16px 20px', background: '#d1fae5', color: '#059669', borderRadius: '12px',
          marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px',
          border: '2px solid #10b981'
        }}>
          <CheckCircle2 size={24} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Nhập kho thành công!</div>
            <div style={{ fontSize: '14px' }}>Mã phiếu: <strong>{submitResult.receiptCode}</strong> - {submitResult.totalProducts} sản phẩm</div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'create' ? renderCreateTab() : renderListTab()}

      {/* Detail Modal */}
      {showDetailModal && renderDetailModal()}

      {/* Loading Overlay */}
      {loading && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9998
        }}>
          <RefreshCw size={40} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Inbound;
