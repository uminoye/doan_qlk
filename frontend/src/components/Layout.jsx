import { useState } from 'react';
import { useNavigate, Outlet, Link, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Truck, Factory, Settings, 
  LogOut, UserCircle, Tag, ArrowDownToLine, ArrowUpFromLine, 
  Menu, ChevronLeft 
} from 'lucide-react';

function Layout() {
  const navigate = useNavigate();
  // State điều khiển việc gập/mở sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userString = localStorage.getItem('user');
  const user = (userString && userString !== "undefined") ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isManager = user.level === 'MANAGER';
  const levelColor = isManager ? '#ef4444' : '#10b981'; 
  const levelText = isManager ? 'TRƯỞNG PHÒNG' : 'NHÂN VIÊN';

  const menuItems = [
    { path: '/', name: 'Tổng quan', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'SALES', 'KHO', 'LOGISTICS', 'NHAMAY'] },
    { path: '/products', name: 'Sản phẩm', icon: <Tag size={20} />, roles: ['ADMIN', 'KHO', 'SALES'] },
    { path: '/customers', name: 'Khách hàng', icon: <UserCircle size={20} />, roles: ['ADMIN', 'SALES'] }, // THÊM DÒNG NÀY VÀO ĐÂY
    { path: '/inbound', name: 'Nhập kho', icon: <ArrowDownToLine size={20} />, roles: ['ADMIN', 'KHO'] },
    { path: '/outbound', name: 'Xuất kho', icon: <ArrowUpFromLine size={20} />, roles: ['ADMIN', 'KHO'] },
    { path: '/sales', name: 'Kinh doanh', icon: <ShoppingCart size={20} />, roles: ['ADMIN', 'SALES'] },
    { path: '/warehouse', name: 'Kho vận', icon: <Package size={20} />, roles: ['ADMIN', 'KHO'] },
    { path: '/logistics', name: 'Vận chuyển', icon: <Truck size={20} />, roles: ['ADMIN', 'LOGISTICS'] },
    { path: '/factory', name: 'Nhà máy', icon: <Factory size={20} />, roles: ['ADMIN', 'NHAMAY'] },
    { path: '/settings', name: 'Hệ thống', icon: <Settings size={20} />, roles: ['ADMIN'] },
  ];

  const allowedMenus = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

      {/* THANH SIDEBAR: Thay đổi width dựa vào isCollapsed, có transition để trượt mượt mà */}
      <div style={{ 
        width: isCollapsed ? '80px' : '260px', 
        minWidth: isCollapsed ? '80px' : '260px', 
        backgroundColor: '#001529', color: 'white', 
        display: 'flex', flexDirection: 'column', height: '100%', 
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)', zIndex: 10,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}>
        
        {/* Khu vực Avatar & Nút Gập/Mở */}
        <div style={{ 
          padding: isCollapsed ? '24px 0' : '24px 20px', 
          borderBottom: '1px solid #002c54', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'space-between',
          flexDirection: isCollapsed ? 'column' : 'row',
          gap: '12px',
          transition: 'all 0.3s ease'
        }}>
          
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <UserCircle size={45} color="#10b981" style={{ flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.full_name}
                </h4>
                <div style={{ backgroundColor: levelColor, color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '6px', fontWeight: 'bold' }}>
                  {levelText}
                </div>
              </div>
            </div>
          ) : (
            <UserCircle size={35} color="#10b981" style={{ marginBottom: '10px' }} />
          )}

          {/* Nút bấm Thu/Phóng */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: isCollapsed ? 'transparent' : '#0f2744', 
              border: 'none', color: '#94a3b8', cursor: 'pointer',
              padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: '0.2s'
            }}
            title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Danh sách Menu */}
        <div style={{ flex: 1, padding: '15px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {allowedMenus.map((item, index) => (
            <Link key={index} to={item.path} 
                  title={isCollapsed ? item.name : ""} // Thêm title để khi gập lại rê chuột vào sẽ hiện tên
                  style={{ 
                    display: 'flex', alignItems: 'center', 
                    padding: isCollapsed ? '14px 0' : '14px 24px', 
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    color: '#94a3b8', textDecoration: 'none', gap: '12px', 
                    transition: 'all 0.2s', borderLeft: '3px solid transparent' 
                  }} 
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#0f2744'; e.currentTarget.style.borderLeft = '3px solid #10b981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              {!isCollapsed && <span style={{ fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap' }}>{item.name}</span>}
            </Link>
          ))}
        </div>

        {/* Nút Đăng xuất */}
        <div style={{ padding: isCollapsed ? '20px 0' : '20px', borderTop: '1px solid #002c54', background: '#001122', display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleLogout} 
                  title="Đăng xuất"
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '10px', backgroundColor: 'transparent', border: 'none', color: '#ef4444', 
                    cursor: 'pointer', fontSize: '15px', width: '100%', fontWeight: 'bold', transition: '0.2s' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}>
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', position: 'relative', transition: 'all 0.3s ease' }}>
        <Outlet />
      </div>

    </div>
  );
}

export default Layout;