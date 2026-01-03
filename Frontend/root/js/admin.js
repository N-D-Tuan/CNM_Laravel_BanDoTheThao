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
                    <h3 class="fw-bold mb-3">QUẢN LÝ DANH MỤC</h3>
                    <div class="alert alert-secondary">Tính năng danh mục đang được cập nhật.</div>
                </div>`;
            break;

        case 'products':
            subContent.innerHTML = `
                <div class="card shadow-sm border-0 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 class="fw-bold mb-0">QUẢN LÝ SẢN PHẨM</h3>
                        <button class="btn btn-success btn-sm"><i class="bi bi-plus-lg"></i> Thêm sản phẩm</button>
                    </div>
                    <div class="bg-light p-5 text-center border rounded">
                        <i class="bi bi-box-seam display-4 text-secondary"></i>
                        <p class="mt-2 text-secondary">Chưa có sản phẩm nào được hiển thị.</p>
                    </div>
                </div>`;
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