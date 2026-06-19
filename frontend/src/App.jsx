import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout'; // Kéo Layout vừa tạo vào

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Bọc Layout ra bên ngoài các trang dùng chung */}
        <Route path="/" element={ <PrivateRoute><Layout /></PrivateRoute> }>
          {/* Dashboard giờ là trang con nằm trong Layout */}
          <Route index element={<Dashboard />} />
          
          {/* Sau này em tạo trang Sales, Kho... thì chỉ cần viết thêm Route con ở đây */}
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;