import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Home } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'               // Nếu chạy ở máy nhà -> Gọi Localhost
  : 'https://doan-qlk.onrender.com/api';      // Nếu chạy trên Vercel -> Gọi Render

const categoryConfig = {
    TV: {
        name: 'Tivi',
        brands: [
            { code: 'SN', name: 'Sony' },
            { code: 'SS', name: 'Samsung' },
            { code: 'LG', name: 'LG' },
            { code: 'TC', name: 'TCL' }
        ],
        unit: 'Cái',
        sizeLabel: 'Kích thước (inch)',
        sizeUnit: 'inch',
        sizeHint: 'VD: 55'
    },
    TL: {
        name: 'Tủ Lạnh',
        brands: [
            { code: 'PNS', name: 'Panasonic' },
            { code: 'AQ', name: 'Aqua' },
            { code: 'TSB', name: 'Toshiba' },
            { code: 'HTC', name: 'Hitachi' }
        ],
        unit: 'Cái',
        sizeLabel: 'Dung tích (Lít)',
        sizeUnit: 'L',
        sizeHint: 'VD: 400'
    },
    MG: {
        name: 'Máy Giặt',
        brands: [
            { code: 'EL', name: 'Electrolux' },
            { code: 'LG', name: 'LG' },
            { code: 'TSB', name: 'Toshiba' },
            { code: 'AQ', name: 'Aqua' }
        ],
        unit: 'Cái',
        sizeLabel: 'Khối lượng (Kg)',
        sizeUnit: 'Kg',
        sizeHint: 'VD: 9',
        hasTypeDetail: true
    },
    ML: {
        name: 'Máy Lạnh',
        brands: [
            { code: 'DK', name: 'Daikin' },
            { code: 'PNS', name: 'Panasonic' },
            { code: 'CP', name: 'Casper' },
            { code: 'SP', name: 'Sharp' }
        ],
        unit: 'Bộ',
        sizeLabel: 'Công suất (HP)',
        sizeUnit: 'HP',
        sizeHint: 'VD: 1.5'
    }
};

function Products() {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]); // State lưu danh sách kho
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWhModalOpen, setIsWhModalOpen] = useState(false); // Modal thêm kho
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [newWarehouseName, setNewWarehouseName] = useState('');

    const userString = localStorage.getItem('user');
    const currentUser = (userString && userString !== "undefined") ? JSON.parse(userString) : null;
    const userRole = currentUser?.role || '';
    const canEdit = userRole === 'ADMIN' || userRole === 'KHO';
    const canDelete = userRole === 'ADMIN';

    const [formData, setFormData] = useState({
        name: '', category_code: 'TV', brand_code: 'SN', size_or_capacity: '',
        type_detail: '', unit: 'Cái', sale_price: '', image_url: '',
        inventory: 0, warehouse_id: ''
    });

    const [skuPreview, setSkuPreview] = useState('SP001');

    // Load Dữ liệu Sản phẩm và Kho
    const fetchData = async () => {
        try {
            const [prodRes, whRes] = await Promise.all([
                fetch(`${API_BASE}/products`),
                fetch(`${API_BASE}/warehouses`)
            ]);
            const prodData = await prodRes.json();
            const whData = await whRes.json();

            if (prodData.success) setProducts(prodData.products);
            if (whData.success) setWarehouses(whData.warehouses);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Tự động tính SKU preview
    useEffect(() => {
        const cat = categoryConfig[formData.category_code];
        if (!cat) return;
        const sameTypeProducts = products.filter(p => p.category_code === formData.category_code);
        const nextSeq = sameTypeProducts.length + 1;
        const seqStr = nextSeq.toString().padStart(3, '0');
        const sizeStr = formData.size_or_capacity ? `-${formData.size_or_capacity}` : '';
        setSkuPreview(`${formData.category_code}-${formData.brand_code}${sizeStr}-${seqStr}`);
    }, [formData.category_code, formData.brand_code, formData.size_or_capacity, products]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category_code') {
            const selectedCategory = categoryConfig[value];
            setFormData({
                ...formData,
                category_code: value,
                brand_code: selectedCategory.brands[0].code,
                size_or_capacity: '',
                type_detail: '',
                unit: selectedCategory.unit
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const openAddModal = () => {
        if (warehouses.length === 0) {
            alert('Bạn chưa có Kho hàng nào! Vui lòng tạo kho trước khi thêm sản phẩm.');
            return;
        }
        setEditingId(null);
        setFormData({
            name: '', category_code: 'TV', brand_code: 'SN',
            size_or_capacity: '', type_detail: '', unit: 'Cái',
            sale_price: '', image_url: '', inventory: 0,
            warehouse_id: warehouses[0].id // Tự động chọn kho đầu tiên
        });
        setIsModalOpen(true);
    };

    const openEditModal = (p) => {
        setEditingId(p.id);
        setFormData({
            name: p.name, category_code: p.category_code, brand_code: p.brand_code,
            size_or_capacity: p.size_or_capacity || '', type_detail: p.type_detail || '',
            unit: p.unit || 'Cái', sale_price: p.sale_price, image_url: p.image_url || '',
            inventory: p.inventory || 0, warehouse_id: p.warehouse_id || (warehouses[0]?.id || '')
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Xác nhận xóa sản phẩm: "${name}" vĩnh viễn?`)) {
            try {
                const response = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
                const data = await response.json();
                if (data.success) fetchData();
                else alert('Lỗi hệ thống: ' + data.message);
            } catch (error) { alert('Lỗi kết nối máy chủ!'); }
        }
    };

    // Lưu Sản Phẩm
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingId ? `${API_BASE}/products/${editingId}` : `${API_BASE}/products`;
            const method = editingId ? 'PUT' : 'POST';

            // 💡 CHÌA KHÓA Ở ĐÂY: Nhét thêm biến sku vào gói dữ liệu trước khi gửi đi
            const dataToSend = {
                ...formData,
                sku: editingId ? products.find(p => p.id === editingId)?.sku : skuPreview
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend) // Gửi dataToSend thay vì formData cũ
            });

            const data = await response.json();
            if (data.success) {
                fetchData();
                setIsModalOpen(false);
            } else alert('Lỗi biểu mẫu: ' + data.message);
        } catch (error) {
            alert('Lỗi kết nối cơ sở dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    // Tạo Kho Mới
    const handleCreateWarehouse = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/warehouses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newWarehouseName })
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message); // Hiển thị thông báo kho đã tạo + 3000 kệ
                setNewWarehouseName('');
                setIsWhModalOpen(false);
                fetchData(); // Tải lại danh sách kho
            } else {
                alert('Lỗi tạo kho: ' + data.message);
            }
        } catch (error) {
            alert('Lỗi kết nối khi tạo kho!');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterType === 'OUT_OF_STOCK') return matchesSearch && Number(p.inventory) === 0;
        if (filterType === 'LOW_STOCK') return matchesSearch && Number(p.inventory) > 0 && Number(p.inventory) < 10;
        return matchesSearch;
    });

    const currentCategory = categoryConfig[formData.category_code];

    return (
        <div style={{ padding: '24px', fontFamily: 'Arial', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: 'bold' }}>Quản lý sản phẩm</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        {products.length} sản phẩm | {warehouses.length} kho hàng hoạt động
                    </p>
                </div>

                {canEdit && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {/* NÚT THÊM KHO MỚI */}
                        <button onClick={() => setIsWhModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)' }}>
                            <Home size={18} /> Thêm kho mới
                        </button>

                        <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}>
                            <Plus size={18} /> Thêm sản phẩm
                        </button>
                    </div>
                )}
            </div>

            {/* Thanh Tìm kiếm */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '11px', left: '12px' }} />
                    <input type="text" placeholder="Tìm theo tên, mã SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', fontSize: '14px' }} />
                </div>
                <button onClick={() => setFilterType('ALL')} style={{ padding: '8px 16px', background: filterType === 'ALL' ? '#10b981' : 'white', color: filterType === 'ALL' ? 'white' : '#334155', border: filterType === 'ALL' ? 'none' : '1px solid #e2e8f0', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Tất cả</button>
                <button onClick={() => setFilterType('LOW_STOCK')} style={{ padding: '8px 16px', background: filterType === 'LOW_STOCK' ? '#10b981' : 'white', color: filterType === 'LOW_STOCK' ? 'white' : '#334155', border: filterType === 'LOW_STOCK' ? 'none' : '1px solid #e2e8f0', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Sắp hết</button>
                <button onClick={() => setFilterType('OUT_OF_STOCK')} style={{ padding: '8px 16px', background: filterType === 'OUT_OF_STOCK' ? '#10b981' : 'white', color: filterType === 'OUT_OF_STOCK' ? 'white' : '#334155', border: filterType === 'OUT_OF_STOCK' ? 'none' : '1px solid #e2e8f0', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Hết hàng</button>
            </div>

            {/* Lưới Sản phẩm */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                {filteredProducts.map((p) => {
                    const isOutOfStock = (p.inventory || 0) === 0;
                    return (
                        <div key={p.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', position: 'relative', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9' }}>
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: p.inventory > 0 ? '#ecfdf5' : '#fee2e2', color: p.inventory > 0 ? '#059669' : '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', zIndex: 1 }}>
                                {p.inventory > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </div>
                            <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', zIndex: 1 }}>
                                {p.category_code}
                            </div>
                            <div style={{ height: '180px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                {p.image_url ? <img src={p.image_url} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#94a3b8', fontSize: '14px' }}>[Chưa cấu hình ảnh]</span>}
                            </div>
                            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: 'bold', lineHeight: '1.4' }}>
                                        {p.name} {p.size_or_capacity ? `(${p.size_or_capacity} ${p.category_code === 'TV' ? 'inch' : p.category_code === 'TL' ? 'L' : p.category_code === 'MG' ? 'Kg' : 'HP'})` : ''}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{p.sku}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{p.brand_code} • {p.type_detail || ''}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                    <div>
                                        <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>{Number(p.sale_price).toLocaleString('vi-VN')} đ</div>
                                        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>/ {p.unit || 'Cái'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: isOutOfStock ? '#dc2626' : '#0f172a', fontWeight: 'bold', fontSize: '16px' }}>{p.inventory || 0}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Tồn kho</div>
                                    </div>
                                </div>
                                {(canEdit || canDelete) && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                                        {canEdit && <button onClick={() => openEditModal(p)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Edit size={14} /></button>}
                                        {canDelete && Number(p.inventory) === 0 && <button onClick={() => handleDelete(p.id, p.name)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL THÊM KHO */}
            {isWhModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#3b82f6', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Home size={20} /> Tạo Kho Hàng Mới
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' }}>
                            Sau khi tạo kho, hệ thống sẽ <b>tự động khởi tạo 3000 vị trí kệ</b> (Zone A, B, C) cho kho này. Quá trình này diễn ra tự động.
                        </p>
                        <form onSubmit={handleCreateWarehouse}>
                            <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Tên Kho *</label>
                            <input
                                required autoFocus
                                value={newWarehouseName}
                                onChange={(e) => setNewWarehouseName(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginTop: '6px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }}
                                placeholder="VD: Kho Tổng Dĩ An..."
                            />
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsWhModalOpen(false)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Hủy</button>
                                <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                    {loading ? 'Đang tạo...' : 'Tạo Kho'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL THÊM SẢN PHẨM */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>
                            {editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Mã SKU (Preview)</label><br />
                                    <input readOnly value={editingId ? (products.find(p => p.id === editingId)?.sku || '') : skuPreview} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #10b981', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 'bold', boxSizing: 'border-box', fontSize: '14px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Đơn vị</label><br />
                                    <input readOnly value={formData.unit} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', boxSizing: 'border-box', fontSize: '13px' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Tên sản phẩm *</label><br />
                                <input required name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }} placeholder="Nhập tên chi tiết sản phẩm..." />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Danh mục *</label><br />
                                    <select name="category_code" value={formData.category_code} onChange={handleChange} disabled={editingId !== null} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: editingId ? '#f8fafc' : 'white', fontSize: '13px' }}>
                                        <option value="TV">Tivi</option>
                                        <option value="TL">Tủ Lạnh</option>
                                        <option value="MG">Máy Giặt</option>
                                        <option value="ML">Máy Lạnh</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Thương hiệu *</label><br />
                                    <select name="brand_code" value={formData.brand_code} onChange={handleChange} disabled={editingId !== null} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: editingId ? '#f8fafc' : 'white', fontSize: '13px' }}>
                                        {currentCategory?.brands.map(brand => <option key={brand.code} value={brand.code}>{brand.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>{currentCategory?.sizeLabel || 'Kích thước'} *</label>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                    <input required type="number" step="0.5" name="size_or_capacity" value={formData.size_or_capacity} onChange={handleChange} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} placeholder={currentCategory?.sizeHint || 'VD: 55'} />
                                    <span style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#64748b', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>{currentCategory?.sizeUnit || ''}</span>
                                </div>
                            </div>

                            {currentCategory?.hasTypeDetail && (
                                <div>
                                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Phân loại máy giặt *</label><br />
                                    <select name="type_detail" value={formData.type_detail} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}>
                                        <option value="">-- Chọn loại --</option>
                                        <option value="Cửa trên">Cửa trên</option>
                                        <option value="Cửa ngang">Cửa ngang</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Ảnh sản phẩm</label><br />
                                <input name="image_url" value={formData.image_url} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }} placeholder="Dán liên kết URL ảnh..." />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Đơn giá (đ) *</label><br />
                                    <input required type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} placeholder="0" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Tồn kho *</label><br />
                                    <input type="number" name="inventory" value={formData.inventory} onChange={handleChange} disabled={!canEdit} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} />
                                </div>
                            </div>

                            {/* CHỖ NÀY ĐÃ ĐƯỢC NÂNG CẤP ĐỂ TỰ ĐỘNG HIỂN THỊ DANH SÁCH KHO TỪ DATABASE */}
                            <div>
                                <label style={{ fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>Lưu tại Kho hàng *</label><br />
                                <select required name="warehouse_id" value={formData.warehouse_id} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}>
                                    {warehouses.map(wh => (
                                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Hủy</button>
                                <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                    {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;