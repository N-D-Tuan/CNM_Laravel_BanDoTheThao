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

    if (!token) {
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

    const loadingEl = document.getElementById('loadingState');
    const contentEl = document.getElementById('cartContent');
    const emptyEl = document.getElementById('emptyCart');

    if (!loadingEl || !contentEl || !emptyEl) return;

    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    emptyEl.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/giohang`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Xử lý lỗi 401 - Token hết hạn
        if (res.status === 401) {
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
        const imgSrc = item.hinhAnh 
            ? (item.hinhAnh.startsWith('http') ? item.hinhAnh : `http://127.0.0.1:8000/storage/${item.hinhAnh}`) 
            : 'https://via.placeholder.com/300';

        container.innerHTML += `
        
            <div class="cart-item border-bottom p-3 mb-3">
                <div class="row align-items-center">
                    <div class="col-md-2 col-3">
                        <img src="${imgSrc}" 
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

    const userLocal = localStorage.getItem('user');
    const user = userLocal ? JSON.parse(userLocal) : null;
    const isAdmin = user && user.role === 'Admin'; // Giả sử trường phân quyền là 'role'

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        if (isAdmin) {
            // Nếu là Admin: Vô hiệu hóa nút và đổi giao diện để người dùng biết
            checkoutBtn.disabled = true;
            checkoutBtn.style.cursor = 'not-allowed';
            checkoutBtn.style.opacity = '0.6';
            checkoutBtn.innerHTML = `<i class="bi bi-slash-circle"></i> Admin không thể thanh toán`;
            checkoutBtn.classList.remove('btn-success');
            checkoutBtn.classList.add('btn-secondary');
        } else {
            // Nếu là User bình thường: Giữ nguyên
            checkoutBtn.disabled = false;
            checkoutBtn.style.cursor = 'pointer';
            checkoutBtn.style.opacity = '1';
            checkoutBtn.innerHTML = `<i class="bi bi-credit-card"></i> Thanh Toán`;
        }
    }

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
// Hàm xóa giỏ hàng thực thi (Không hỏi confirm)
window.executeClearCart = async function() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/giohang`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            // Cập nhật lại giao diện ngay lập tức
            cartData = { items: [], tongTien: 0, soLuongSanPham: 0 };
            const emptyEl = document.getElementById('emptyCart');
            const contentEl = document.getElementById('cartContent');
            
            if (emptyEl && contentEl) {
                contentEl.style.display = 'none';
                emptyEl.style.display = 'block';
            }
            
            if (typeof updateCartCount === 'function') updateCartCount();
        }
    } catch (error) {
        console.error('Lỗi tự động xóa giỏ hàng:', error);
    }
}

// Giữ nguyên hàm cũ cho nút bấm "Xóa toàn bộ" trên giao diện
window.clearCart = async function() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
        await window.executeClearCart();
    }
}

/* ================== CHECKOUT ================== */
window.checkout = function() {
    if (!cartData.items || cartData.items.length === 0) {
        showNotification('⚠️ Giỏ hàng của bạn đang trống!', 'warning');
        return;
    }
    
    if (typeof showPage === 'function') {
        showPage('thanh-toan');
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

// Cập nhật hàm checkout trong cart.js
window.checkout = async function() {
    if (!cartData.items || cartData.items.length === 0) {
        showNotification('⚠️ Giỏ hàng trống!', 'warning');
        return;
    }

    //Làm sạch địa chỉ và ghi chú trước khi hiển thị trang thanh toán
    sessionStorage.removeItem('pendingAddress');
    sessionStorage.removeItem('pendingNote'); 

    const address = document.getElementById('orderAddress').value.trim();
    const note = document.getElementById('orderNote').value.trim();

    if (!address) {
        showNotification('⚠️ Vui lòng nhập địa chỉ giao hàng!', 'warning');
        return;
    }

    sessionStorage.setItem('pendingAddress', address);
    sessionStorage.setItem('pendingNote', note);

    const token = localStorage.getItem('access_token');

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/vnpay/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                amount: cartData.tongTien,
                order_id: "LPT" + Date.now()
            })
        });

        // Kiểm tra nếu response không thành công (ví dụ lỗi 500)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lỗi server");
        }

        const result = await response.json();
        if (result.status === 'success' && result.payment_url) {
            window.location.href = result.payment_url;
        }
    } catch (error) {
        console.error("VNPay Error:", error);
        alert("Lỗi khi tạo liên kết thanh toán: " + error.message);
    }
}

window.processOrderCreation = async function () {
    const token = localStorage.getItem('access_token');
    const userLocal = localStorage.getItem('user');
    const address = sessionStorage.getItem('pendingAddress');
    const note = sessionStorage.getItem('pendingNote');
    
    if (!token || !userLocal || !address) {
        console.error("Thiếu thông tin: Token, User hoặc Địa chỉ.");
        return;
    }

    const user = JSON.parse(userLocal);

    try {
        const cartRes = await fetch(`http://127.0.0.1:8000/api/giohang`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const cartResult = await cartRes.json();

        if (!cartResult.success || !cartResult.data.items || cartResult.data.items.length === 0) {
            console.error("Giỏ hàng rỗng hoặc không lấy được dữ liệu.");
            return;
        }

        const orderData = {
            maNguoiDung: user.maNguoiDung,
            diaChi: address,
            ghiChu: note,
            sanPhams: cartResult.data.items.map(item => ({
                maSanPham: item.maSanPham,
                soLuong: item.soLuong
            }))
        };
        const res = await fetch(`http://127.0.0.1:8000/api/donhang`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const result = await res.json();

        if (res.ok && result.status) {
            await window.executeClearCart();

            sessionStorage.removeItem('pendingAddress');
            sessionStorage.removeItem('pendingNote');           
        }else {
            console.error("Lỗi từ Backend khi tạo đơn:", result.message);
        }
    } catch (error) {
        console.error("Lỗi tạo đơn hàng sau thanh toán:", error);
    } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}