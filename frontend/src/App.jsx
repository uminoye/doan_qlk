import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định sẽ tạm thời dẫn vào Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Đường dẫn trang đăng nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* Nếu gõ đường dẫn bậy bạ, tự động bắt quay về trang chủ */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;