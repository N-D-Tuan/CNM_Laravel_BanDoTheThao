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
                        <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Thêm User</button>
                    </div>
                    <div class="table-responsive mt-3">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="user-table-body">
                                <tr><td colspan="5" class="text-center text-muted">Đang tải dữ liệu...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>`;
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