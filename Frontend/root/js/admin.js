window.loadAdminStats = async function() {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/users/stats`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('stat-total-users').innerText = data.total_users;
            document.getElementById('stat-customers').innerText = data.customers;
            document.getElementById('stat-admins').innerText = data.admins;
            document.getElementById('stat-deleted').innerText = data.deleted_users;
        }
    } catch (e) { console.error("Lỗi nạp thống kê:", e); }
};

window.setActive = (element) => {
    // 1. Tìm tất cả các link có class 'nav-link' trong sidebar
    const sidebarLinks = document.querySelectorAll('#admin-sidebar-nav .nav-link');
    
    // 2. Duyệt qua từng link và xóa class 'active'
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 3. Thêm class 'active' duy nhất cho mục vừa được click
    element.classList.add('active');
};

// --- LẤY DANH SÁCH NGƯỜI DÙNG ĐANG HOẠT ĐỘNG ---
window.fetchUserList = async function() {
    const token = localStorage.getItem('access_token');
    toggleUserListButtons('active');
    
    try {
        const response = await fetch(`${API_URL}/users/all`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const users = await response.json();
        renderUserTable(users, false);
    } catch (e) { console.error("Lỗi nạp danh sách user:", e); }
};

// --- LẤY DANH SÁCH NGƯỜI DÙNG ĐÃ XÓA MỀM ---
window.fetchDeletedUsers = async function() {
    const token = localStorage.getItem('access_token');
    toggleUserListButtons('deleted');
    
    try {
        const response = await fetch(`${API_URL}/users/deleted-list`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const users = await response.json();
        renderUserTable(users, true);
    } catch (e) { console.error("Lỗi nạp danh sách đã xóa:", e); }
};

// --- VẼ BẢNG NGƯỜI DÙNG ---
function renderUserTable(users, isDeletedView) {
    const tbody = document.getElementById('user-table-body');
    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Không có dữ liệu.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.maNguoiDung}</td>
            <td class="fw-bold">${user.tenNguoiDung}</td>
            <td>${user.email}</td>
            <td>${user.soDienThoai}</td>
            <td><span class="badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-info'}">${user.role}</span></td>
            <td class="text-center">
                ${isDeletedView ? `
                    <button class="btn btn-sm btn-success" onclick="confirmRestore(${user.maNguoiDung})">
                        <i class="bi bi-arrow-counterclockwise"></i> Khôi phục
                    </button>
                ` : `
                    <button class="btn btn-sm btn-warning me-1" onclick="openEditUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil-square"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete(${user.maNguoiDung})">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

function toggleUserListButtons(type) {
    document.getElementById('btn-active-users').classList.toggle('active', type === 'active');
    document.getElementById('btn-deleted-users').classList.toggle('active', type === 'deleted');
}

// --- XÓA MỀM ---
window.confirmDelete = async function(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này vào thùng rác?")) return;
    
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (response.ok) {
            alert("Đã xóa người dùng thành công!");
            fetchUserList();
            loadAdminStats(); // Cập nhật lại số liệu thống kê
        }
    } catch (e) { alert("Lỗi khi xóa người dùng"); }
};

// --- KHÔI PHỤC ---
window.confirmRestore = async function(id) {
    if (!confirm("Bạn muốn khôi phục tài khoản này?")) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/users/restore/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (response.ok) {
            alert("Khôi phục thành công!");
            fetchDeletedUsers();
            loadAdminStats();
        }
    } catch (e) { alert("Lỗi khi khôi phục"); }
};

window.openEditUserModal = function(user) {
    document.getElementById('edit-user-id').value = user.maNguoiDung;
    document.getElementById('edit-user-name').value = user.tenNguoiDung;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-phone').value = user.soDienThoai;
    document.getElementById('edit-user-role').value = user.role;
    
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
};

window.handleAdminUpdateUser = async function() {
    const id = document.getElementById('edit-user-id').value;
    const token = localStorage.getItem('access_token');
    const updatedData = {
        tenNguoiDung: document.getElementById('edit-user-name').value,
        email: document.getElementById('edit-user-email').value,
        soDienThoai: document.getElementById('edit-user-phone').value,
        role: document.getElementById('edit-user-role').value
    };

    try {
        const response = await fetch(`${API_URL}/users/admin-edit/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
                'Accept': 'application/json' 
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            alert("Cập nhật thành công!");
            fetchUserList();
        } else {
            alert(data.message || "Có lỗi xảy ra khi cập nhật!");
        }
    } catch (e) { alert("Lỗi khi cập nhật"); }
};

window.showAdminContent = function(type) {
    const subContent = document.getElementById('admin-sub-content');
    if (!subContent) return;

    if (window.event) window.event.preventDefault();

    const currentEvent = window.event;
    if (currentEvent && currentEvent.currentTarget) {
        document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => link.classList.remove('active'));
        currentEvent.currentTarget.classList.add('active');
    }

//==========================================================
// danh muc

window.fetchCategories = async function() {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/danh-muc`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await response.json();
        renderCategoryTable(categories);
    } catch (e) {
        console.error("Lỗi nạp danh mục:", e);
    }
};

function renderCategoryTable(categories) {
    const tbody = document.getElementById('category-table-body');
    if (!categories || categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Chưa có danh mục nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>#${cat.maDanhMuc}</td>
            <td class="fw-bold text-primary">${cat.tenDanhMuc}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="promptEditCategory(${cat.maDanhMuc}, '${cat.tenDanhMuc}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.maDanhMuc})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Xóa danh mục
window.deleteCategory = async function(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này? (Lưu ý: Không thể xóa nếu còn sản phẩm)")) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/danh-muc/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const res = await response.json();
        
        if (response.ok) {
            alert("Xóa thành công!");
            fetchCategories();
        } else {
            alert(res.message || "Không thể xóa danh mục này.");
        }
    } catch (e) { alert("Lỗi kết nối server"); }
};

// Thêm 
window.promptAddCategory = async function() {
    const name = prompt("Nhập tên danh mục mới:");
    if (!name) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/danh-muc`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tenDanhMuc: name })
        });

        if (response.ok) {
            alert("Thêm danh mục thành công!");
            fetchCategories();
        }
    } catch (e) { alert("Lỗi khi thêm danh mục"); }
};

// Sửa 
window.promptEditCategory = async function(id, oldName) {
    const name = prompt("Nhập tên mới cho danh mục:", oldName);
    if (!name || name === oldName) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/danh-muc/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tenDanhMuc: name })
        });

        if (response.ok) {
            alert("Cập nhật thành công!");
            fetchCategories();
        }
    } catch (e) { alert("Lỗi khi sửa danh mục"); }
};

//===========================================================
// san pham

window.fetchProducts = async function(page = 1) {
    const token = localStorage.getItem('access_token');
    
    const keyword = document.getElementById('search-keyword')?.value || '';
    const cateId = document.getElementById('filter-category')?.value || '';

    try {
        let url = `${API_URL}/san-pham/filter?page=${page}`; 
        
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (cateId) url += `&categoryId=${cateId}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();

        const products = result.data ? result.data : [];

        renderProductTable(products);

        if (result.last_page > 1) {
            renderPagination(result);
        } else {
            document.getElementById('pagination-controls').innerHTML = ''; 
        }

    } catch (e) {
        console.error("Lỗi nạp sản phẩm:", e);
        document.getElementById('product-table-body').innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi kết nối server</td></tr>`;
    }
};

window.renderPagination = function(meta) {
    const paginationContainer = document.getElementById('pagination-controls');
    let html = '';

    // Nút Previous
    html += `<li class="page-item ${meta.current_page === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="fetchProducts(${meta.current_page - 1})">Trước</button>
             </li>`;

    // Các nút số trang (Vẽ đơn giản: hiện tất cả các trang)
    for (let i = 1; i <= meta.last_page; i++) {
        html += `<li class="page-item ${meta.current_page === i ? 'active' : ''}">
                    <button class="page-link" onclick="fetchProducts(${i})">${i}</button>
                 </li>`;
    }

    // Nút Next
    html += `<li class="page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}">
                <button class="page-link" onclick="fetchProducts(${meta.current_page + 1})">Sau</button>
             </li>`;

    paginationContainer.innerHTML = html;
};

function renderProductTable(products) {
    const tbody = document.getElementById('product-table-body');
    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Chưa có sản phẩm nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(sp => {
        const imageUrl = sp.hinhAnh && sp.hinhAnh.startsWith('http') 
            ? sp.hinhAnh 
            : (sp.hinhAnh ? `http://127.0.0.1:8000/storage/${sp.hinhAnh}` : 'https://via.placeholder.com/50');
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.giaBan);
        const categoryName = sp.danhmucsanpham ? sp.danhmucsanpham.tenDanhMuc : 'Chưa phân loại';
        
        const spString = JSON.stringify(sp).replace(/"/g, '&quot;');

        return `
        <tr>
            <td>${sp.maSanPham}</td>
            <td><img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td class="fw-bold">${sp.tenSanPham}</td>
            <td><span class="badge bg-info text-dark">${categoryName}</span></td>
            <td class="text-danger fw-bold">${price}</td>
            <td>${sp.soLuongTon}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-info text-white me-1" onclick="openFeatureModal(${sp.maSanPham}, '${sp.tenSanPham}')" title="Quản lý tính năng">
                    <i class="bi bi-list-stars"></i>
                </button>
                
                <button class="btn btn-sm btn-warning me-1" onclick="openEditProductModal(${spString})">
                    <i class="bi bi-pencil-square"></i>
                </button>
                
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${sp.maSanPham})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

// thêm
window.openAddProductModal = async function() {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/danh-muc`, { headers: { 'Authorization': `Bearer ${token}` } });
        const categories = await response.json();

        const selectBox = document.getElementById('add-prod-cate');
        selectBox.innerHTML = '<option value="">-- Chọn danh mục --</option>' + 
            categories.map(c => `<option value="${c.maDanhMuc}">${c.tenDanhMuc}</option>`).join('');

        document.getElementById('addProductForm').reset();
        
        new bootstrap.Modal(document.getElementById('addProductModal')).show();
    } catch (e) { alert("Lỗi tải danh mục"); }
};

// xóa sản phẩm
window.deleteProduct = async function(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?")) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/san-pham/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Đã xóa sản phẩm!");
            fetchProducts();
        } else {
            alert("Lỗi khi xóa sản phẩm");
        }
    } catch (e) { alert("Lỗi kết nối server"); }
};

window.saveNewProduct = async function() {
    const formData = new FormData();
    formData.append('tenSanPham', document.getElementById('add-prod-name').value);
    formData.append('maDanhMuc', document.getElementById('add-prod-cate').value);
    formData.append('giaNhap', document.getElementById('add-prod-cost').value);
    formData.append('giaBan', document.getElementById('add-prod-price').value);
    formData.append('soLuongTon', document.getElementById('add-prod-stock').value);
    formData.append('moTa', document.getElementById('add-prod-desc').value);
    
    const fileInput = document.getElementById('add-prod-img');
    if (fileInput.files[0]) formData.append('hinhAnh', fileInput.files[0]);

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/san-pham`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, 
            body: formData
        });

        if (response.ok) {
            alert("Thêm thành công!");
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            fetchProducts();
        } else {
            const res = await response.json();
            alert("Lỗi: " + (res.message || "Kiểm tra dữ liệu nhập"));
        }
    } catch (e) { alert("Lỗi server"); }
};

window.openEditProductModal = async function(product) {
    const token = localStorage.getItem('access_token');
    
    try {
        const resCat = await fetch(`${API_URL}/danh-muc`, { headers: { 'Authorization': `Bearer ${token}` } });
        const categories = await resCat.json();

        const selectBox = document.getElementById('edit-prod-cate');
        selectBox.innerHTML = categories.map(c => 
            `<option value="${c.maDanhMuc}" ${c.maDanhMuc == product.maDanhMuc ? 'selected' : ''}>${c.tenDanhMuc}</option>`
        ).join('');

        document.getElementById('edit-prod-id').value = product.maSanPham;
        document.getElementById('edit-prod-name').value = product.tenSanPham;
        document.getElementById('edit-prod-cost').value = product.giaNhap;
        document.getElementById('edit-prod-price').value = product.giaBan;
        document.getElementById('edit-prod-stock').value = product.soLuongTon;
        document.getElementById('edit-prod-desc').value = product.moTa || '';
        document.getElementById('edit-prod-img').value = ''; 

        const previewDiv = document.getElementById('current-img-preview');
        if (product.hinhAnh) {
            previewDiv.innerHTML = `<small>Ảnh hiện tại:</small><br><img src="http://127.0.0.1:8000/storage/${product.hinhAnh}" style="height:60px">`;
        } else {
            previewDiv.innerHTML = '';
        }

        new bootstrap.Modal(document.getElementById('editProductModal')).show();

    } catch (e) { console.error(e); alert("Lỗi khi mở form sửa"); }
};

window.saveUpdateProduct = async function() {
    const id = document.getElementById('edit-prod-id').value;
    const token = localStorage.getItem('access_token');

    const formData = new FormData();
    formData.append('tenSanPham', document.getElementById('edit-prod-name').value);
    formData.append('maDanhMuc', document.getElementById('edit-prod-cate').value);
    formData.append('giaNhap', document.getElementById('edit-prod-cost').value);
    formData.append('giaBan', document.getElementById('edit-prod-price').value);
    formData.append('soLuongTon', document.getElementById('edit-prod-stock').value);
    formData.append('moTa', document.getElementById('edit-prod-desc').value);

    const fileInput = document.getElementById('edit-prod-img');
    if (fileInput.files[0]) {
        formData.append('hinhAnh', fileInput.files[0]);
    }

    formData.append('_method', 'PUT');

    try {
        const response = await fetch(`${API_URL}/san-pham/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            alert("Cập nhật thành công!");
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            fetchProducts();
        } else {
            const res = await response.json();
            alert("Lỗi: " + (res.message || "Không thể cập nhật"));
        }
    } catch (e) { alert("Lỗi kết nối"); }
};

// lọc

window.loadCategoriesForFilter = async function() {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_URL}/danh-muc`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await response.json();
        
        const selectBox = document.getElementById('filter-category');
        if (selectBox) {
            // Giữ nguyên option đầu tiên (Tất cả), nối thêm danh mục mới
            selectBox.innerHTML = '<option value="">-- Tất cả danh mục --</option>' + 
                categories.map(c => `<option value="${c.maDanhMuc}">${c.tenDanhMuc}</option>`).join('');
        }
    } catch (e) { console.error("Lỗi tải danh mục lọc", e); }
};

//tinh nang

window.openFeatureModal = function(productId, productName) {
    // Lưu ID sản phẩm vào biến ẩn để lát nữa thêm tính năng biết thêm cho ai
    document.getElementById('feat-prod-id').value = productId;
    document.getElementById('feat-prod-name').innerText = "Sản phẩm: " + productName;
    document.getElementById('feat-new-name').value = ''; // Xóa trắng ô nhập

    // Hiển thị Modal
    new bootstrap.Modal(document.getElementById('featureModal')).show();

    // Gọi hàm tải dữ liệu ngay lập tức
    loadFeatures(productId);
};

// 2. Hàm tải danh sách từ Server
window.loadFeatures = async function(productId) {
    const token = localStorage.getItem('access_token');
    const tbody = document.getElementById('feature-list-body');
    
    // Hiện chữ "Đang tải..." cho chuyên nghiệp
    tbody.innerHTML = '<tr><td colspan="2" class="text-center">Đang tải...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/tinh-nang/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const res = await response.json();
        
        // API của bạn trả về: { message: "...", data: [...] }
        const features = res.data; 

        if (!features || features.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Chưa có tính năng nào.</td></tr>';
            return;
        }

        // Vẽ danh sách ra bảng
        tbody.innerHTML = features.map(f => `
            <tr>
                <td>${f.tenTinhNang}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteFeature(${f.maTinhNang})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="2" class="text-center text-danger">Lỗi kết nối!</td></tr>';
    }
};

// 3. Hàm Thêm Tính năng Mới
window.addFeature = async function() {
    const productId = document.getElementById('feat-prod-id').value;
    const featName = document.getElementById('feat-new-name').value;
    const token = localStorage.getItem('access_token');

    if (!featName.trim()) {
        alert("Vui lòng nhập tên tính năng!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tinh-nang`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maSanPham: productId,
                tenTinhNang: featName
            })
        });

        if (response.ok) {
            // Thêm xong thì tải lại danh sách luôn để thấy kết quả
            loadFeatures(productId);
            document.getElementById('feat-new-name').value = ''; // Xóa ô nhập để nhập tiếp
            document.getElementById('feat-new-name').focus();
        } else {
            alert("Lỗi khi thêm tính năng!");
        }
    } catch (e) { alert("Lỗi kết nối server!"); }
};

// 4. Hàm Xóa Tính năng
window.deleteFeature = async function(featureId) {
    if (!confirm("Bạn chắc chắn muốn xóa tính năng này?")) return;

    const token = localStorage.getItem('access_token');
    const productId = document.getElementById('feat-prod-id').value; // Lấy ID để reload lại list

    try {
        const response = await fetch(`${API_URL}/tinh-nang/${featureId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadFeatures(productId); // Xóa xong tải lại danh sách
        } else {
            alert("Không thể xóa (Có thể do lỗi server).");
        }
    } catch (e) { alert("Lỗi kết nối!"); }
};

    switch(type) {
        case 'users':
            subContent.innerHTML = `
                <div class="card shadow-sm border-0 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 class="fw-bold mb-0 text-primary">QUẢN LÝ NGƯỜI DÙNG</h3>
                        <div class="btn-group">
                            <button class="btn btn-outline-primary btn-sm active" id="btn-active-users" onclick="fetchUserList()">
                                <i class="bi bi-person-check"></i> Đang hoạt động
                            </button>
                            <button class="btn btn-outline-danger btn-sm" id="btn-deleted-users" onclick="fetchDeletedUsers()">
                                <i class="bi bi-person-x"></i> Thùng rác
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive mt-3">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th class="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="user-table-body">
                                <tr><td colspan="6" class="text-center py-4">Đang tải dữ liệu...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>`;
            fetchUserList(); 
            break;

        case 'categories':
            subContent.innerHTML = `
                <div class="card shadow-sm border-0 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 class="fw-bold mb-0 text-primary">QUẢN LÝ DANH MỤC</h3>
                        <button class="btn btn-primary btn-sm" onclick="promptAddCategory()">
                            <i class="bi bi-plus-lg"></i> Thêm danh mục
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Mã DM</th>
                                    <th>Tên Danh Mục</th>
                                    <th class="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="category-table-body">
                                <tr><td colspan="4" class="text-center py-4">Đang tải dữ liệu...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>`;
            fetchCategories(); 
            break;

        case 'products':
            subContent.innerHTML = `
                <div class="card shadow-sm border-0 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 class="fw-bold mb-0 text-primary">QUẢN LÝ SẢN PHẨM</h3>
                        <button class="btn btn-success btn-sm" onclick="openAddProductModal()">
                            <i class="bi bi-plus-lg"></i> Thêm sản phẩm
                        </button>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-md-5">
                            <input type="text" id="search-keyword" class="form-control" placeholder="Nhập tên sản phẩm..." onkeypress="if(event.key==='Enter') fetchProducts(1)">
                        </div>
                        <div class="col-md-4">
                            <select id="filter-category" class="form-select" onchange="fetchProducts(1)">
                                <option value="">-- Tất cả danh mục --</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-primary w-100" onclick="fetchProducts(1)">
                                <i class="bi bi-search"></i> Tìm kiếm
                            </button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Hình ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Giá bán</th>
                                    <th>Tồn kho</th>
                                    <th class="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="product-table-body">
                                <tr><td colspan="7" class="text-center py-4">Đang tải dữ liệu...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <nav class="d-flex justify-content-center mt-3">
                        <ul class="pagination" id="pagination-controls"></ul>
                    </nav>
                </div>`;
            
            loadCategoriesForFilter();
            fetchProducts(1); 
            break;

        case 'orders':
            subContent.innerHTML = `
                <div class="card shadow-sm border-0 p-4">
                    <h3 class="fw-bold mb-3">QUẢN LÝ ĐƠN HÀNG</h3>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>Mã ĐH</th>
                                    <th>Khách hàng</th>
                                    <th>Ngày đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="6" class="text-center py-4 text-muted">Chưa có đơn hàng nào cần xử lý.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>`;
            break;
            
        default:
            subContent.innerHTML = `
                <div class="alert alert-light border shadow-sm p-4">
                    <h5 class="fw-bold"><i class="bi bi-info-circle me-2"></i>Hệ thống quản trị LPT Store</h5>
                    <p class="mb-0 text-muted">Vui lòng chọn các tính năng ở thanh menu bên trái để thực hiện tác vụ quản lý.</p>
                </div>`;
            loadAdminStats(); 
            break;
    }
};