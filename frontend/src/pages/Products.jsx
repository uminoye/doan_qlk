import { useState, useEffect } from 'react';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bộ nhớ tạm để lưu thông tin em gõ vào Form
  const [formData, setFormData] = useState({
    name: '',
    category_code: 'TV',
    brand_code: 'SN',
    size_or_capacity: '',
    unit: 'Cái',
    sale_price: ''
  });

  // Hàm gọi Backend để lấy danh sách sản phẩm hiện có
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

  // Vừa vào trang là tự động gọi hàm lấy danh sách
  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm lắng nghe em gõ chữ vào ô input nào thì lưu vào ô đó
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm gửi thông tin lên Backend khi em bấm nút "Thêm"
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
        fetchProducts(); // Cập nhật lại bảng ngay lập tức
        // Xóa trắng form để nhập món khác
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#176b52' }}>🏷️ Quản lý Danh mục Sản phẩm</h2>

      {/* --- KHU VỰC 1: FORM THÊM SẢN PHẨM --- */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>✨ Thêm sản phẩm mới</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label>Tên sản phẩm *</label><br/>
            <input required name="name" value={formData.name} onChange={handleChange} style={{ padding: '8px', width: '220px', marginTop: '5px' }} placeholder="VD: Tivi Sony 4K" />
          </div>
          <div>
            <label>Phân loại</label><br/>
            <select name="category_code" value={formData.category_code} onChange={handleChange} style={{ padding: '8px', width: '120px', marginTop: '5px' }}>
              <option value="TV">Tivi (TV)</option>
              <option value="TL">Tủ Lạnh (TL)</option>
              <option value="MG">Máy Giặt (MG)</option>
              <option value="ML">Máy Lạnh (ML)</option>
            </select>
          </div>
          <div>
            <label>Hãng (Thương hiệu)</label><br/>
            <select name="brand_code" value={formData.brand_code} onChange={handleChange} style={{ padding: '8px', width: '120px', marginTop: '5px' }}>
              <option value="SN">Sony (SN)</option>
              <option value="SS">Samsung (SS)</option>
              <option value="LG">LG (LG)</option>
              <option value="PNS">Panasonic (PNS)</option>
            </select>
          </div>
          <div>
            <label>Kích cỡ / Dung tích</label><br/>
            <input name="size_or_capacity" value={formData.size_or_capacity} onChange={handleChange} style={{ padding: '8px', width: '140px', marginTop: '5px' }} placeholder="VD: 55inch" />
          </div>
          <div>
            <label>Giá bán (VNĐ) *</label><br/>
            <input required type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} style={{ padding: '8px', width: '140px', marginTop: '5px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: loading ? '#ccc' : '#176b52', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Đang lưu...' : '+ Thêm Sản Phẩm'}
          </button>
        </form>
      </div>

      {/* --- KHU VỰC 2: BẢNG DANH SÁCH --- */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>📋 Danh sách Sản phẩm hiện có</h3>
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
                <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold', color: '#176b52' }}>{p.sku}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{p.name} {p.size_or_capacity ? `(${p.size_or_capacity})` : ''}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{p.category_code} - {p.brand_code}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{Number(p.sale_price).toLocaleString('vi-VN')} đ</td>
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