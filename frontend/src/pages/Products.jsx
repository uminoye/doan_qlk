import { useState, useEffect } from 'react';

// Cấu hình Từ điển liên đới: Phân loại -> Hãng & Đơn vị (Khớp 100% với Sơ đồ kho)
const categoryConfig = {
  TV: { 
    name: 'Tivi', 
    brands: [{code: 'SN', name: 'Sony'}, {code: 'SS', name: 'Samsung'}, {code: 'LG', name: 'LG'}, {code: 'TCL', name: 'TCL'}], 
    unit: 'Cái', 
    sizeHint: 'VD: 55 inch' 
  },
  TL: { 
    name: 'Tủ Lạnh', 
    brands: [{code: 'PNS', name: 'Panasonic'}, {code: 'AQ', name: 'Aqua'}, {code: 'TSB', name: 'Toshiba'}, {code: 'HTC', name: 'Hitachi'}], 
    unit: 'Cái', 
    sizeHint: 'VD: 400 lít' 
  },
  MG: { 
    name: 'Máy Giặt', 
    brands: [{code: 'EL', name: 'Electrolux'}, {code: 'LG', name: 'LG'}, {code: 'TSB', name: 'Toshiba'}, {code: 'AQ', name: 'Aqua'}], 
    unit: 'Cái', 
    sizeHint: 'VD: 9 kg' 
  },
  ML: { 
    name: 'Máy Lạnh', 
    brands: [{code: 'DK', name: 'Daikin'}, {code: 'PNS', name: 'Panasonic'}, {code: 'CP', name: 'Casper'}, {code: 'SP', name: 'Sharp'}], 
    unit: 'Bộ', 
    sizeHint: 'VD: 1.5 HP' 
  }
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Trạng thái ẩn/hiện Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Khởi tạo form mặc định là Tivi (TV)
  const [formData, setFormData] = useState({
    name: '',
    category_code: 'TV',
    brand_code: 'SN',
    size_or_capacity: '',
    unit: 'Cái',
    sale_price: ''
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://doan-qlk.onrender.com/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category_code') {
      const selectedCategory = categoryConfig[value];
      setFormData({
        ...formData,
        category_code: value,
        brand_code: selectedCategory.brands[0].code,
        unit: selectedCategory.unit
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://doan-qlk.onrender.com/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Đã thêm sản phẩm thành công!');
        fetchProducts(); 
        setIsModalOpen(false); // Đóng popup sau khi thêm xong
        setFormData({ ...formData, name: '', size_or_capacity: '', sale_price: '' }); // Xóa trắng form
      } else {
        alert('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      alert('❌ Lỗi kết nối đến máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categoryConfig[formData.category_code];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#176b52', margin: 0 }}>🏷️ Quản lý Danh mục Sản phẩm</h2>
        
        {/* NÚT MỞ POPUP */}
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 20px', background: '#176b52', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
          + Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* --- KHU VỰC 1: POPUP (MODAL) LƠ LỬNG --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Màn sương đen mờ mờ
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999 // Đẩy nó lên trên cùng mọi thứ
        }}>
          {/* CÁI HỘP TRẮNG LƠ LỬNG NẰM Ở GIỮA */}
          <div style={{
            background: 'white', padding: '25px', borderRadius: '12px',
            width: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Nút X để đóng nhanh ở góc phải */}
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' }}>
              ✖
            </button>

            <h3 style={{ marginTop: 0, color: '#176b52', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              ✨ Thêm Sản Phẩm Mới
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex