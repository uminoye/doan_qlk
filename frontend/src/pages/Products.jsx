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
  
  // Trạng thái ẩn/hiện Form
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Khởi tạo form mặc định là Tivi (TV)
  const [formData, setFormData] = useState({
    name: '',
    category_code: 'TV',
    brand_code: 'SN', // Mặc định lấy hãng đầu tiên của TV
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

  // Hàm xử lý khi người dùng thay đổi dữ liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu đổi "Phân loại", tự động đổi Hãng đầu tiên và Đơn vị tương ứng
    if (name === 'category_code') {
      const selectedCategory = categoryConfig[value];
      setFormData({
        ...formData,
        category_code: value,
        brand_code: selectedCategory.brands[0].code, // Tự nhảy về hãng đầu tiên
        unit: selectedCategory.unit                  // Tự đổi đơn vị
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
        fetchProducts(); // Cập nhật lại bảng
        // Tự động đóng Form và xóa trắng Tên + Giá, giữ lại Phân loại cũ
        setIsFormOpen(false);
        setFormData({ ...formData, name: '', size_or_capacity: '', sale_price: '' });
      } else {
        alert('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      alert('❌ Lỗi kết nối đến máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // Biến hỗ trợ để lấy danh sách Hãng và Đơn vị hiện tại dựa trên Category đang chọn
  const currentCategory = categoryConfig[formData.category_code];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#176b52' }}>🏷️ Quản lý Danh mục Sản phẩm</h2>
        
        {/* NÚT ẨN HIỆN FORM NẰM Ở GÓC PHẢI */}
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          style={{ padding: '10px 20px', background: isFormOpen ? '#dc3545' : '#176b52', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isFormOpen ? '✖ Đóng Form' : '+ Thêm Sản Phẩm Mới'}
        </button>
      </div>

      {/* --- KHU VỰC 1: FORM THÊM SẢN PHẨM (CHỈ HIỆN KHI isFormOpen === true) --- */}
      {isFormOpen && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', transition: '0.3s' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>✨ Điền thông tin hàng hóa</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            
            {/* Phân Loại */}
            <div>
              <label>1. Phân loại</label><br/>
              <select name="category_code" value={formData.category_code} onChange={handleChange} style={{ padding: '8px', width: '130px', marginTop: '5px' }}>
                <option value="TV">Tivi</option>
                <option value="TL">Tủ Lạnh</option>
                <option value="MG">Máy Giặt</option>
                <option value="ML">Máy Lạnh</option>
              </select>
            </div>

            {/* Thương Hiệu (Liên động với Phân loại) */}
            <div>
              <label>2. Thương hiệu</label><br/>
              <select name="brand_code" value={formData.brand_code} onChange={handleChange} style={{ padding: '8px', width: '130px', marginTop: '5px' }}>
                {currentCategory.brands.map(brand => (
                  <option key={brand.code} value={brand.code}>{brand.name} ({brand.code})</option>
                ))}
              </select>
            </div>

            {/* Tên Sản Phẩm */}
            <div>
              <label>3. Tên sản phẩm *</label><br/>
              <input required name="name" value={formData.name} onChange={handleChange} style={{ padding: '8px', width: '220px', marginTop: '5px' }} placeholder="Nhập tên..." />
            </div>

            {/* Kích Cỡ / Dung Tích */}
            <div>
              <label>4. Thông số (Kích cỡ)</label><br/>
              <input name="size_or_capacity" value={formData.size_or_capacity} onChange={handleChange} style={{ padding: '8px', width: '140px', marginTop: '5px' }} placeholder={currentCategory.sizeHint} />
            </div>

            {/* Đơn vị tính (Tự động) */}
            <div>
              <label>5. Đơn vị</label><br/>
              <input readOnly value={currentCategory.unit} style={{ padding: '8px', width: '80px', marginTop: '5px', backgroundColor: '#e9ecef', border: '1px solid #ccc', color: '#666' }} />
            </div>

            {/* Giá Bán */}
            <div>
              <label>6. Giá bán (VNĐ) *</label><br/>
              <input required type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} style={{ padding: '8px', width: '140px', marginTop: '5px' }} placeholder="0 đ"/>
            </div>

            {/* Nút Submit */}
            <button type="submit" disabled={loading} style={{ padding: '9px 20px', background: loading ? '#ccc' : '#001529', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Đang lưu...' : 'LƯU SẢN PHẨM'}
            </button>
          </form>
        </div>
      )}

      {/* --- KHU VỰC 2: BẢNG DANH SÁCH --- */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#001529', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Mã Hàng (SKU)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên Sản Phẩm</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Phân loại</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Chưa có sản phẩm nào trong từ điển!</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #ddd', '&:hover': { background: '#f5f5f5' } }}>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold', color: '#176b52' }}>{p.sku}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{p.name} {p.size_or_capacity ? `(${p.size_or_capacity})` : ''}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <span style={{ background: '#e6f7ff', color: '#0050b3', padding: '3px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                      {p.category_code}
                    </span>
                    {' - '}
                    <span style={{ color: '#555' }}>{p.brand_code}</span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>{Number(p.sale_price).toLocaleString('vi-VN')} đ</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;