/* ================== STATE ================== */
let cartData = {
    items: [],
    tongTien: 0,
    soLuongSanPham: 0
};

/* ================== INIT ================== */
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCart();
    setupEventListeners();
});

/* ================== KIỂM TRA ĐĂNG NHẬP ================== */
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html'; 
    }
}

/* ================== LOAD GIỎ HÀNG ================== */
async function loadCart() {
    const token = localStorage.getItem('authToken');
    
    try {
        showLoading();
        
        const res = await fetch(`${API_URL}/giohang`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await res.json();
        
        if (result.success) {
            cartData = result.data;
            
            if (cartData.items.length === 0) {
                showEmptyCart();
            } else {
                renderCart();
            }
        } else {
            showNotification('Không thể tải giỏ hàng', 'error');
        }
        
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification('Không thể kết nối đến server', 'error');
        showEmptyCart();
    }
}

/* ================== RENDER GIỎ HÀNG ================== */
function renderCart() {
    hideLoading();
    
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';
    
    cartData.items.forEach(item => {
        const isOutOfStock = item.soLuong > item.soLuongTon;
        
        const itemHTML = `
            <div class="cart-item">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.hinhAnh || '/images/no-image.png'}" 
                         alt="${item.tenSanPham}" 
                         class="cart-item-img">
                    
                    <div class="cart-item-info flex-grow-1">
                        <h5>${item.tenSanPham}</h5>
                        <div class="cart-item-category">
                            <i class="bi bi-tag"></i> ${item.tenDanhMuc || 'Chưa phân loại'}
                        </div>
                        <div class="cart-item-price">
                            ${formatPrice(item.giaBan)} VNĐ
                        </div>
                        ${isOutOfStock ? `
                            <div class="stock-warning">
                                <i class="bi bi-exclamation-triangle"></i> 
                                Chỉ còn ${item.soLuongTon} sản phẩm
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="quantity-control">
                        <button class="quantity-btn" 
                                onclick="updateQuantity(${item.maSanPham}, ${item.soLuong - 1})"
                                ${item.soLuong <= 1 ? 'disabled' : ''}>
                            -
                        </button>
                        
                        <input type="number" 
                               class="form-control quantity-input" 
                               value="${item.soLuong}" 
                               readonly>
                        
                        <button class="quantity-btn" 
                                onclick="updateQuantity(${item.maSanPham}, ${item.soLuong + 1})"
                                ${item.soLuong >= item.soLuongTon ? 'disabled' : ''}>
                            +
                        </button>
                    </div>
                    
                    <div class="text-end" style="min-width: 150px;">
                        <div class="fw-bold mb-2">
                            ${formatPrice(item.thanhTien)} VNĐ
                        </div>
                        <button class="btn btn-sm btn-remove" 
                                onclick="removeFromCart(${item.maSanPham})">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        cartItemsContainer.innerHTML += itemHTML;
    });
    
    updateSummary();
    document.getElementById('cartContent').style.display = 'block';
}

/* ================== CẬP NHẬT SỐ LƯỢNG ================== */
async function updateQuantity(maSanPham, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) return;
    
    const token = localStorage.getItem('authToken');
    const item = cartData.items.find(i => i.maSanPham === maSanPham);
    
    if (newQuantity > item.soLuongTon) {
        showNotification(`Chỉ còn ${item.soLuongTon} sản phẩm trong kho`, 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/giohang/${maSanPham}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ soLuong: newQuantity })
        });
        
        const result = await res.json();
        
        if (result.success) {
            await loadCart();
            showNotification('Cập nhật số lượng thành công', 'success');
        } else {
            showNotification(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification('Không thể cập nhật', 'error');
    }
}

/* ================== XÓA SẢN PHẨM ================== */
async function removeFromCart(maSanPham) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    const token = localStorage.getItem('authToken');
    
    try {
        const res = await fetch(`${API_URL}/giohang/${maSanPham}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await res.json();
        
        if (result.success) {
            await loadCart();
            showNotification('Đã xóa sản phẩm', 'success');
        } else {
            showNotification(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification('Không thể xóa', 'error');
    }
}

/* ================== XÓA TOÀN BỘ ================== */
async function clearCart() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    
    const token = localStorage.getItem('authToken');
    
    try {
        const res = await fetch(`${API_URL}/giohang`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await res.json();
        
        if (result.success) {
            await loadCart();
            showNotification('Đã xóa toàn bộ giỏ hàng', 'success');
        }
        
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification('Không thể xóa', 'error');
    }
}

/* ================== HELPER FUNCTIONS ================== */
function updateSummary() {
    document.getElementById('totalItems').textContent = cartData.soLuongSanPham;
    document.getElementById('subtotal').textContent = formatPrice(cartData.tongTien) + ' VNĐ';
    document.getElementById('totalPrice').textContent = formatPrice(cartData.tongTien) + ' VNĐ';
}

function checkout() {
    const outOfStock = cartData.items.find(item => item.soLuong > item.soLuongTon);
    
    if (outOfStock) {
        showNotification('Có sản phẩm hết hàng. Vui lòng cập nhật!', 'error');
        return;
    }
    
    window.location.href = 'thanh-toan.html'; // Hoặc checkout.html
}

function setupEventListeners() {
    document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);
    document.getElementById('checkoutBtn')?.addEventListener('click', checkout);
}

function formatPrice(price) {
    return Number(price).toLocaleString('vi-VN');
}

function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('emptyCart').style.display = 'none';
    document.getElementById('cartContent').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

function showEmptyCart() {
    hideLoading();
    document.getElementById('emptyCart').style.display = 'block';
    document.getElementById('cartContent').style.display = 'none';
}

function showNotification(message, type = 'success') {
    const oldNotif = document.querySelector('.toast-notification');
    if (oldNotif) oldNotif.remove();

    const notification = document.createElement('div');
    notification.className = `toast-notification alert alert-${type === 'success' ? 'success' : 'danger'}`;
    notification.style.cssText = `
        position: fixed; top: 80px; right: 20px; z-index: 9999;
        min-width: 300px; padding: 15px 20px; border-radius: 8px;
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