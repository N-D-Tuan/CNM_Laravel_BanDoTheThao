/* ================== STATE ================== */
let cartData = {
    items: [],
    tongTien: 0,
    soLuongSanPham: 0
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCart();
    setupEventListeners();
});

/* ================== AUTH ================== */
function checkAuth() {
    const token = localStorage.getItem('access_token');
    
    console.log('=== DEBUG CART AUTH ===');
    console.log('Token:', token);
    
    if (!token) {
        console.error('Không có token!');
        // Chuyển về trang đăng nhập
        if (typeof showPage === 'function') {
            showPage('login');
        } else {
            window.location.href = '#login';
        }
        return false;
    }
    return true;
}

/* ================== LOAD CART ================== */
async function loadCart() {
    if (!checkAuth()) return;
    
    const token = localStorage.getItem('access_token');

    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('cartContent').style.display = 'none';
    document.getElementById('emptyCart').style.display = 'none';

    try {
        console.log('=== LOADING CART ===');
        console.log('API URL:', `${API_URL}/giohang`);
        console.log('Token:', token);

        const res = await fetch(`${API_URL}/giohang`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', res.status);

        // Xử lý lỗi 401 - Token hết hạn
        if (res.status === 401) {
            console.error('Token hết hạn!');
            localStorage.clear();
            showNotification('⚠️ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!', 'warning');
            setTimeout(() => {
                if (typeof showPage === 'function') {
                    showPage('login');
                } else {
                    window.location.href = '#login';
                }
            }, 1500);
            return;
        }

        const result = await res.json();
        console.log('Response data:', result);

        document.getElementById('loadingState').style.display = 'none';

        if (result.success && result.data?.items?.length) {
            cartData = result.data;
            renderCart();
        } else {
            showEmptyCart();
        }

    } catch (err) {
        console.error('Error loading cart:', err);
        document.getElementById('loadingState').style.display = 'none';
        showEmptyCart();
        showNotification('❌ Không thể tải giỏ hàng!', 'error');
    }
}

/* ================== RENDER CART ================== */
function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    cartData.items.forEach(item => {
        container.innerHTML += `
            <div class="cart-item border-bottom p-3 mb-3">
                <div class="row align-items-center">
                    <div class="col-md-2 col-3">
                        <img src="${item.hinhAnh || '/images/no-image.png'}" 
                             class="img-fluid rounded cart-item-img" 
                             alt="${item.tenSanPham}">
                    </div>
                    
                    <div class="col-md-4 col-9">
                        <h6 class="mb-1">${item.tenSanPham}</h6>
                        <div class="text-primary fw-bold">${formatPrice(item.giaBan)} VNĐ</div>
                        ${item.tenDanhMuc ? `<small class="text-muted">${item.tenDanhMuc}</small>` : ''}
                    </div>

                    <div class="col-md-3 col-6 mt-2 mt-md-0">
                        <div class="quantity-control">
                            <button class="quantity-btn btn-sm"
                                onclick="updateQuantity(${item.maSanPham}, ${item.soLuong - 1})"
                                ${item.soLuong <= 1 ? 'disabled' : ''}>
                                <i class="bi bi-dash"></i>
                            </button>

                            <input type="text" 
                                   class="quantity-input form-control form-control-sm" 
                                   value="${item.soLuong}" 
                                   readonly>

                            <button class="quantity-btn btn-sm"
                                onclick="updateQuantity(${item.maSanPham}, ${item.soLuong + 1})"
                                ${item.soLuong >= item.soLuongTon ? 'disabled' : ''}>
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        <small class="text-muted d-block mt-1">
                            Còn ${item.soLuongTon} sản phẩm
                        </small>
                    </div>

                    <div class="col-md-3 col-6 text-end mt-2 mt-md-0">
                        <div class="fw-bold text-success fs-5 mb-2">
                            ${formatPrice(item.thanhTien)} VNĐ
                        </div>
                        <button class="btn btn-sm btn-outline-danger btn-remove"
                            onclick="removeFromCart(${item.maSanPham})">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    updateSummary();
    document.getElementById('cartContent').style.display = 'block';
    document.getElementById('emptyCart').style.display = 'none';
}

/* ================== EMPTY CART ================== */
function showEmptyCart() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('cartContent').style.display = 'none';
    document.getElementById('emptyCart').style.display = 'block';
}

/* ================== UPDATE QUANTITY ================== */
async function updateQuantity(id, qty) {
    if (qty < 1) return;

    const token = localStorage.getItem('access_token');

    try {
        const res = await fetch(`${API_URL}/giohang/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ soLuong: qty })
        });

        const result = await res.json();

        if (res.ok && result.success) {
            showNotification('✓ Cập nhật số lượng thành công!', 'success');
            loadCart();
        } else {
            showNotification(result.message || 'Lỗi cập nhật!', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Không thể cập nhật!', 'error');
    }
}

/* ================== REMOVE ITEM ================== */
async function removeFromCart(id) {
    if (!confirm('Xóa sản phẩm này khỏi giỏ hàng?')) return;

    const token = localStorage.getItem('access_token');

    try {
        const res = await fetch(`${API_URL}/giohang/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const result = await res.json();

        if (res.ok && result.success) {
            showNotification('✓ Đã xóa sản phẩm!', 'success');
            loadCart();
        } else {
            showNotification(result.message || 'Lỗi xóa!', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Không thể xóa!', 'error');
    }
}

/* ================== CLEAR CART ================== */
async function clearCart() {
    if (!confirm('Xóa toàn bộ giỏ hàng?')) return;

    const token = localStorage.getItem('access_token');

    try {
        const res = await fetch(`${API_URL}/giohang`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const result = await res.json();

        if (res.ok && result.success) {
            showNotification('✓ Đã xóa toàn bộ giỏ hàng!', 'success');
            loadCart();
        } else {
            showNotification(result.message || 'Lỗi xóa!', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Không thể xóa!', 'error');
    }
}

/* ================== CHECKOUT ================== */
function checkout() {
    if (cartData.items.length === 0) {
        showNotification('⚠️ Giỏ hàng trống!', 'warning');
        return;
    }
    
    // Chuyển đến trang thanh toán
    if (typeof showPage === 'function') {
        showPage('thanh-toan');
    } else {
        window.location.href = '#thanh-toan';
    }
}

/* ================== EVENTS ================== */
function setupEventListeners() {
    const clearBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}

/* ================== SUMMARY ================== */
function updateSummary() {
    document.getElementById('totalItems').textContent = cartData.soLuongSanPham;
    document.getElementById('subtotal').textContent = formatPrice(cartData.tongTien) + ' VNĐ';
    document.getElementById('totalPrice').textContent = formatPrice(cartData.tongTien) + ' VNĐ';
}

function formatPrice(n) {
    return Number(n).toLocaleString('vi-VN');
}

/* ================== NOTIFICATION ================== */
function showNotification(message, type = 'success') {
    const oldNotif = document.querySelector('.toast-notification');
    if (oldNotif) oldNotif.remove();

    const notification = document.createElement('div');
    notification.className = `toast-notification alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
            <span>${message}</span>
            <button type="button" class="btn-close ms-3" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}