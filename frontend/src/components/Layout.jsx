import { useNavigate, Outlet, Link, Navigate } from 'react-router-dom'; // Bổ sung công cụ Navigate ở đây
import { LayoutDashboard, ShoppingCart, Package, Truck, Factory, Settings, LogOut, UserCircle } from 'lucide-react';

function Layout() {
  const navigate = useNavigate();

  // Lấy thông tin user từ bộ nhớ trình duyệt
  const userString = localStorage.getItem('user');
  const user = (userString && userString !== "undefined") ? JSON.parse(userString) : null;

  // LỚP BẢO VỆ THÉP: Nếu có token mà mất user, tự động đá văng ra trang Login!
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Cấu hình màu sắc cho thanh Level
  const isManager = user.level === 'MANAGER';
  const levelColor = isManager ? '#ff4d4f' : '#52c41a'; // Đỏ quyền lực cho Manager, Xanh lá cho Staff
  const levelText = isManager ? 'TRƯỞNG PHÒNG' : 'NHÂN VIÊN';

  // Danh sách Menu thông minh (Chỉ hiện khi user có role phù hợp)
  const menuItems = [
    { path: '/', name: 'Tổng quan', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'SALES', 'KHO', 'LOGISTICS', 'NHAMAY'] },
    { path: '/sales', name: 'Kinh doanh', icon: <ShoppingCart size={20} />, roles: ['ADMIN', 'SALES'] },
    { path: '/warehouse', name: 'Kho vận', icon: <Package size={20} />, roles: ['ADMIN', 'KHO'] },
    { path: '/logistics', name: 'Vận chuyển', icon: <Truck size={20} />, roles: ['ADMIN', 'LOGISTICS'] },
    { path: '/factory', name: 'Nhà máy', icon: <Factory size={20} />, roles: ['ADMIN', 'NHAMAY'] },
    { path: '/settings', name: 'Hệ thống', icon: <Settings size={20} />, roles: ['ADMIN'] },
  ];

  // Lọc ra những menu mà user hiện tại được phép xem
  const allowedMenus = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' }}>

      {/* THANH SIDEBAR BÊN TRÁI */}
      <div style={{ width: '260px', backgroundColor: '#001529', color: 'white', display: 'flex', flexDirection: 'column' }}>

        {/* Khu vực Avatar & Level */}
        <div style={{ padding: '20px', borderBottom: '1px solid #002c54', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCircle size={45} color="#176b52" />
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{user.full_name}</h4>
            <div style={{
              backgroundColor: levelColor,
              color: 'white',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '10px',
              display: 'inline-block',
              marginTop: '5px',
              fontWeight: 'bold'
            }}>
              {levelText} ({user.role})
            </div>
          </div>
        </div>

        {/* Danh sách Menu */}
        <div style={{ flex: 1, padding: '15px 0' }}>
          {allowedMenus.map((item, index) => (
            <Link key={index} to={item.path} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', color: '#a6adb4', textDecoration: 'none', gap: '10px', transition: '0.3s' }}>
              {item.icon}
              <span style={{ fontSize: '15px' }}>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Nút Đăng xuất ở cuối cùng */}
        <div style={{ padding: '15px 20px', borderTop: '1px solid #002c54' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '15px', width: '100%' }}>
            <LogOut size={20} />
            <b>Đăng xuất</b>
          </button>
        </div>
      </div>

      {/* KHU VỰC NỘI DUNG CHÍNH (Đổi theo từng trang) */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>

    </div>
  );
}

export default Layout;