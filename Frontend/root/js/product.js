/* ================== STATE ================== */
let filters = {
    categoryId: 0,
    minPrice: null,
    maxPrice: null,
    sort: null,
    keyword: null,
    page: 1
};

/* ================== LOAD DANH MỤC ================== */
async function loadCategories() {
    const res = await fetch(`${API_URL}/danh-muc`);
    const data = await res.json();

    const ul = document.getElementById('dynamic-categories');
    if (!ul) return;

    ul.innerHTML = `
        <li class="mb-3">
            <a href="#"
               class="category-link d-block py-3 px-4 rounded fw-bold text-dark active-category"
               data-category-id="0">
               Tất cả
            </a>
        </li>
    `;

    data.forEach(dm => {
        ul.innerHTML += `
            <li class="mb-3">
                <a href="#"
                   class="category-link d-block py-3 px-4 rounded fw-bold text-dark"
                   data-category-id="${dm.maDanhMuc}">
                   ${dm.tenDanhMuc}
                </a>
            </li>
        `;
    });

    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            document.querySelectorAll('.category-link')
                .forEach(l => l.classList.remove('active-category'));

            link.classList.add('active-category');

            filters.categoryId = Number(link.dataset.categoryId);
            filters.page = 1;
            reloadProducts();
        });
    });
}

/* ================== LOAD SẢN PHẨM ================== */
async function reloadProducts() {
    const params = new URLSearchParams();
    if (filters.keyword && filters.keyword.trim() !== '') {
        params.append('keyword', filters.keyword.trim());
    }
    if (filters.categoryId !== 0)
        params.append('categoryId', filters.categoryId);

    if (filters.minPrice !== null && filters.maxPrice !== null) {
        params.append('minPrice', filters.minPrice);
        params.append('maxPrice', filters.maxPrice);
    }

    if (filters.sort)
        params.append('sort', filters.sort);

    params.append('page', filters.page);

    const url = `${API_URL}/san-pham/filter?${params.toString()}`;

    const res = await fetch(url);
    const result = await res.json();

    renderProducts(result.data);
    renderPagination(result);
}

/* ================== RENDER ================== */
function renderProducts(products) {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!products.length) {
        grid.innerHTML = `<p class="text-center text-muted">Không có sản phẩm</p>`;
        return;
    }

    products.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.hinhAnh || ''}">
                <div class="card-body text-center">
                    <h5>${p.tenSanPham}</h5>
                    <p class="text-success fw-bold">
                        ${Number(p.giaBan).toLocaleString()} VNĐ
                    </p>
                    <button class="btn btn-primary w-100 add-to-cart-btn" 
                            data-product-id="${p.maSanPham}"
                            data-product-name="${p.tenSanPham}"
                            data-product-price="${p.giaBan}"
                            data-product-image="${p.hinhAnh}">
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;
    });

    setupAddToCartButtons();
}

function renderPagination(meta) {
    const ul = document.getElementById('pagination');
    if (!ul) return;

    ul.innerHTML = '';

    if (meta.last_page <= 1) return;

    // Prev
    ul.innerHTML += `
        <li class="page-item ${meta.current_page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${meta.current_page - 1}">
                &laquo;
            </a>
        </li>
    `;

    for (let i = 1; i <= meta.last_page; i++) {
        ul.innerHTML += `
            <li class="page-item ${i === meta.current_page ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Next
    ul.innerHTML += `
        <li class="page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${meta.current_page + 1}">
                &raquo;
            </a>
        </li>
    `;

    ul.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = Number(link.dataset.page);
            if (!page || page < 1 || page > meta.last_page) return;
            filters.page = page;
            reloadProducts();
        });
    });
}

/* ================== FILTER GIÁ ================== */
function setupPriceFilter() {
    const checkboxes = document.querySelectorAll('.price-checkbox');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            if (!this.checked) {
                filters.minPrice = null;
                filters.maxPrice = null;
                reloadProducts();
                return;
            }

            checkboxes.forEach(c => c !== this && (c.checked = false));

            filters.minPrice = this.dataset.priceFrom
                ? Number(this.dataset.priceFrom)
                : 0;

            filters.maxPrice = this.dataset.priceTo
                ? Number(this.dataset.priceTo)
                : 999999999;
            filters.page = 1;
            reloadProducts();
        });
    });
}

/* ================== SORT ================== */
function setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', function () {
        filters.sort = this.value !== '0' ? this.value : null;
        filters.page = 1;
        reloadProducts();
    });
}

function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchInput) return;

    searchBtn.addEventListener('click', () => {
        filters.keyword = searchInput.value.trim();
        filters.page = 1;
        reloadProducts();
    });

    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            filters.keyword = e.target.value.trim();
            filters.page = 1;
            reloadProducts();
        }
    });
}

/* ================== INIT ================== */
function initProductPage() {
    loadCategories();
    reloadProducts();
    setupPriceFilter();
    setupSort();
    setupSearch();
    updateCartCount();
}

document.addEventListener('DOMContentLoaded', initProductPage);

/* ================== GIỎ HÀNG ================== */

/**
 * Thiết lập nút "Thêm vào giỏ"
 */
function setupAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', async function() {
            this.disabled = true;
            const originalText = this.textContent;
            this.textContent = 'Đang xử lý...';

            const productId = this.dataset.productId;
            const productName = this.dataset.productName;

            // ✅ SỬA: Đổi thành access_token
            const token = localStorage.getItem('access_token');
            
            // 🔍 DEBUG
            console.log('=== DEBUG ADD TO CART ===');
            console.log('Token:', token);
            console.log('Product ID:', productId);
            
            if (!token) {
                showNotification('⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'warning');
                
                // ✅ SỬA: Sử dụng showPage thay vì window.location.href
                setTimeout(() => {
                    if (typeof showPage === 'function') {
                        showPage('login');
                    } else {
                        // Fallback cho trường hợp không có showPage
                        window.location.href = '#login';
                    }
                }, 1500);
                
                this.disabled = false;
                this.textContent = originalText;
                return;
            }

            try {
                const res = await fetch(`${API_URL}/giohang`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        maSanPham: parseInt(productId),
                        soLuong: 1
                    })
                });

                console.log('Response status:', res.status);
                const result = await res.json();
                console.log('Response data:', result);

                if (res.ok && result.success) {
                    showNotification(`✓ Đã thêm "${productName}" vào giỏ hàng!`, 'success');
                    updateCartCount();
                } else {
                    // Xử lý lỗi 401 - token hết hạn
                    if (res.status === 401) {
                        showNotification('⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'warning');
                        localStorage.clear();
                        setTimeout(() => {
                            if (typeof showPage === 'function') {
                                showPage('login');
                            } else {
                                window.location.href = '#login';
                            }
                        }, 1500);
                    } else {
                        showNotification(result.message || 'Có lỗi xảy ra!', 'error');
                    }
                }

            } catch (error) {
                console.error('Lỗi khi thêm vào giỏ:', error);
                showNotification('❌ Không thể kết nối tới server!', 'error');
            } finally {
                this.disabled = false;
                this.textContent = originalText;
            }
        });
    });
}

/**
 * Hiển thị thông báo toast
 */
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
        max-width: 500px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
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

/**
 * Cập nhật số lượng giỏ hàng trên header
 */
async function updateCartCount() {
    // ✅ SỬA: Đổi thành access_token
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        const cartBadge = document.getElementById('cartCount');
        if (cartBadge) cartBadge.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/giohang/count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        const result = await res.json();
        
        if (result.success) {
            const count = result.data.count;
            const cartBadge = document.getElementById('cartCount');
            
            if (cartBadge) {
                if (count > 0) {
                    cartBadge.textContent = count;
                    cartBadge.style.display = 'inline-block';
                } else {
                    cartBadge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số giỏ hàng:', error);
    }
}

// CSS Animation cho toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);