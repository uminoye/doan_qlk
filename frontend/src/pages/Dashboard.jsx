import { useState, useEffect } from 'react';
import { Package, Tags, ArrowDownToLine, Database, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'               // Nếu chạy ở máy nhà -> Gọi Localhost
  : 'https://doan-qlk.onrender.com/api';      // Nếu chạy trên Vercel -> Gọi Render

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventory: 0,
    lowStock: 0,
    capacity: []
  });
  const [loading, setLoading] = useState(true);
  const [setupMessage, setSetupMessage] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // Gọi nhiều API cùng lúc để lấy số liệu thống kê
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [prodRes, invRes, overviewRes] = await Promise.all([
        fetch(`${API_BASE}/products`, { headers }).then(res => res.json()),
        fetch(`${API_BASE}/inventory`, { headers }).then(res => res.json()),
        fetch(`${API_BASE}/inbound/warehouse-overview`, { headers }).then(res => res.json())
      ]);

      let totalInv = 0;
      let lowStockCount = 0;

      if (invRes.success) {
        totalInv = invRes.data.reduce((sum, item) => sum + Number(item.So_Luong_Ton), 0);
      }

      if (prodRes.success) {
        lowStockCount = prodRes.products.filter(p => Number(p.inventory) <= 5).length;
      }

      // Xử lý dữ liệu sức chứa kho (Mô phỏng sức chứa tối đa mỗi khu là 500 Bin)
      const MAX_BIN_PER_ZONE = 500; 
      let capacityData = [];
      if (overviewRes.success && overviewRes.data) {
        Object.values(overviewRes.data).forEach(cat => {
          Object.values(cat.zones).forEach(zone => {
            const used = MAX_BIN_PER_ZONE - zone.emptyCount;
            const percent = Math.round((used / MAX_BIN_PER_ZONE) * 100);
            capacityData.push({
              name: zone.zoneName,
              code: zone.zoneCode,
              used: used,
              total: MAX_BIN_PER_ZONE,
              percent: percent > 0 ? percent : 0
            });
          });
        });
      }

      setStats({
        totalProducts: prodRes.success ? prodRes.products.length : 0,
        totalInventory: totalInv,
        lowStock: lowStockCount,
        capacity: capacityData.slice(0, 4) // Lấy 4 khu vực tiêu biểu để vẽ biểu đồ
      });

    } catch (error) {
      console.error('Lỗi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Giữ lại nút Setup kho phòng hờ giáo viên bắt chạy thử từ đầu
  const generateBins = async () => {
    setSetupLoading(true);
    setSetupMessage('⏳ Đang nhờ thợ xây dựng 3000 vị trí kệ kho...');
    try {
      const response = await fetch(`${API_BASE}/locations/generate`, { method: 'POST' });
      const data = await response.json();
      setSetupMessage(data.success ? `✅ ${data.message}` : `❌ Lỗi: ${data.message}`);
    } catch (error) {
      setSetupMessage('❌ Lỗi kết nối đến máy chủ!');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} color="#3b82f6" /> Tổng quan Hệ thống
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Báo cáo số liệu kho theo thời gian thực</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Cập nhật
        </button>
      </div>

      {/* 4 Thẻ Chỉ Số (Metric Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>TỔNG MÃ HÀNG (SKU)</p>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '28px', fontWeight: '900' }}>{stats.totalProducts}</h3>
            </div>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}><Tags size={24} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>TỔNG TỒN KHO THỰC</p>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '28px', fontWeight: '900' }}>{stats.totalInventory}</h3>
            </div>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', color: '#10b981' }}><Package size={24} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>PHIẾU CHỜ DUYỆT</p>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '28px', fontWeight: '900' }}>0</h3>
            </div>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}><ArrowDownToLine size={24} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>HÀNG SẮP HẾT</p>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '28px', fontWeight: '900' }}>{stats.lowStock}</h3>
            </div>
            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '12px', color: '#ef4444' }}><Database size={24} /></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Biểu đồ Sức chứa Kho (Tự code bằng CSS) */}
        <div style={{ flex: 2, minWidth: '400px', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>Công suất lưu trữ theo khu vực</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {stats.capacity.length === 0 && <p style={{ color: '#94a3b8' }}>Chưa có dữ liệu kho...</p>}
            
            {stats.capacity.map((zone, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                  <span>{zone.name} ({zone.code})</span>
                  <span>{zone.percent}% ({zone.used}/{zone.total})</span>
                </div>
                {/* Thanh Progress Bar */}
                <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${zone.percent}%`, 
                    height: '100%', 
                    background: zone.percent > 80 ? '#ef4444' : zone.percent > 50 ? '#f59e0b' : '#10b981',
                    borderRadius: '10px',
                    transition: 'width 1s ease-in-out'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

export default Dashboard;