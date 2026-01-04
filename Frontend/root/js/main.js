const API_URL = "http://127.0.0.1:8000/api";

async function showPage(pageName) {
    const res = await fetch(`pages/${pageName}.html`);
    const html = await res.text();
    document.getElementById('main-content').innerHTML = html;

    const footer = document.getElementById('footer-placeholder');
    if (footer) {
        const noFooterPages = ['login', 'register', 'forgot-password', 'reset-password', 'profile', 'change-password', 'order-user'];
        if (noFooterPages.includes(pageName)) {
            footer.style.display = 'none';
        } else {
            footer.style.display = 'block';
        }
    }

    if (pageName === 'admin-dashboard') {
        window.loadAdminStats();
    }

    if (pageName === 'trang-chu') {
        const myCarousel = document.querySelector('#homeAboutCarousel');
        if (myCarousel) {
            new bootstrap.Carousel(myCarousel, {
                interval: 2000,
                ride: 'carousel'
            });
        }
    }

    if (pageName === 'profile') {
        fillProfileData();
    }

    if (pageName === "order-user") {
        setTimeout(async () => {
            if (window.loadUserOrders) {
            await window.loadUserOrders()
            }

            if (window.renderUserOrders) {
            window.renderUserOrders("Tất cả")
            }
        }, 0)
    }


    if (pageName === 'san-pham') {
        if (typeof window.initProductPage === 'function') {
            setTimeout(() => window.initProductPage(), 100);
        }
    }
    window.scrollTo(0, 0);

    if (pageName === 'gio-hang') {
    setTimeout(() => {
        if (window.loadCart) {
            window.loadCart();
        }
    }, 100);
}
}

async function init() {
    // Nạp Header/Footer
    const header = await fetch('components/header.html').then(r => r.text());
    document.getElementById('header-placeholder').innerHTML = header;

    const footerHtml = await fetch('components/footer.html').then(r => r.text());
    document.getElementById('footer-placeholder').innerHTML = footerHtml;

    // Kiểm tra login để hiển thị nút
    renderHeader();
    showPage('trang-chu');
}

function renderHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authSection = document.getElementById('auth-buttons');

    if (user) {
        const adminLink = user.role === 'Admin'
            ? `<li><a class="dropdown-item fw-bold text-primary" href="#" onclick="showPage('admin-dashboard')"><i class="bi bi-speedometer2 me-2"></i>Admin Dash</a></li>
               <li><hr class="dropdown-divider"></li>`
            : '';

        const orderLink = user.role !== 'Admin' 
            ? `<li><a class="dropdown-item" href="#" onclick="showPage('order-user')"><i class="bi bi-bag me-2"></i>Đơn hàng</a></li>` 
            : '';

        authSection.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-dark dropdown-toggle d-flex align-items-center border-0" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle fs-4 me-2 text-primary"></i>
                    <span class="fw-bold">${user.tenNguoiDung}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow">
                    ${adminLink}
                    <li><a class="dropdown-item" href="#" onclick="showPage('profile')"><i class="bi bi-person me-2"></i>Hồ sơ</a></li>
                    <li><a class="dropdown-item" href="#" onclick="showPage('change-password')"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu</a></li>
                    ${orderLink}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="handleLogout()">
                        <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </a></li>
                </ul>
            </div>`;
    } else {
        authSection.innerHTML = `
            <button class="btn btn-outline-light me-2 fw-bold" onclick="showPage('login')">Đăng nhập</button>
            <button class="btn btn-primary fw-bold" onclick="showPage('register')">Đăng ký</button>`;
    }
}

function fillProfileData() {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Đang điền dữ liệu cho user:", user); // Kiểm tra trong console

    if (user) {
        // Đảm bảo ID các ô input trong profile.html khớp hoàn toàn
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');
        const roleInput = document.getElementById('profile-role');

        if (nameInput) nameInput.value = user.tenNguoiDung || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.soDienThoai || '';
        if (roleInput) roleInput.value = user.role || '';
    }
}

// Hàm hiển thị chi tiết sản phẩm (Gọi từ product.js)
async function showProductDetail(id) {
    const mainContent = document.getElementById('main-content');
    
    // 1. Tải file HTML (chỉ phần body)
    const res = await fetch('pages/product-detail.html');
    const html = await res.text();
    
    // 2. Gán vào main-content (giữ nguyên Header/Footer của index.html)
    mainContent.innerHTML = html;
    
    // 3. Đảm bảo Footer hiển thị
    const footer = document.getElementById('footer-placeholder');
    if (footer) footer.style.display = 'block';

    // 4. Cuộn lên đầu trang
    window.scrollTo(0, 0);

    // 5. Gọi hàm load dữ liệu từ file product-detail.js
    if (typeof window.loadProductDetail === 'function') {
        window.loadProductDetail(id);
    } else {
        console.error("Không tìm thấy hàm loadProductDetail. Kiểm tra lại việc nhúng file script.");
    }
}

window.onload = init;