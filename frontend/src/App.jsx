import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout'; 
import Warehouse from './pages/Warehouse';
import Products from './pages/Products';
import Inbound from './pages/Inbound';
import Sales from './pages/Sales';
import Customers from './pages/Customers'; // 1. IMPORT FILE KHÁCH HÀNG VÀO ĐÂY

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
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inbound" element={<Inbound />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/customers" element={<Customers />} /> {/* 2. KHAI BÁO TUYẾN ĐƯỜNG KHÁCH HÀNG Ở ĐÂY */}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;