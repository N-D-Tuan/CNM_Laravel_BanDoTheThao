const API_BASE_URL = "http://127.0.0.1:8000/api"; 
const SERVER_URL = "http://127.0.0.1:8000"; 

// === CÁC BIẾN TOÀN CỤC QUẢN LÝ DỮ LIỆU & PHÂN TRANG ===
let allReviews = [];            // Tất cả đánh giá gốc lấy từ Server
let currentFilteredReviews = []; // Danh sách đánh giá đang hiển thị (sau khi lọc)
let currentProductId = null;

// Cấu hình phân trang
let currentPage = 1;       // Trang hiện tại
const reviewsPerPage = 5;  // Số lượng hiển thị mỗi trang (theo ý bạn là 5)

// Hàm chính
window.loadProductDetail = function(id) {
    if (id) {
        currentProductId = id;
        fetchProductDetailData(id);
        fetchProductFeaturesData(id);
        fetchProductReviews(id);
    } else {
        alert("Không tìm thấy ID sản phẩm!");
    }
};

// 1. Lấy thông tin chi tiết (Giữ nguyên)
async function fetchProductDetailData(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/san-pham/${id}`);
        const product = await response.json();
        
        console.log("Dữ liệu sản phẩm:", product); 
        console.log("Số lượng tồn:", product.soLuongTon);

        document.getElementById("detail-name").innerText = product.tenSanPham;
        document.getElementById("breadcrumb-name").innerText = product.tenSanPham;
        document.getElementById("detail-price").innerText = Number(product.giaBan).toLocaleString('vi-VN') + ' VNĐ';
        document.getElementById("detail-id").innerText = product.maSanPham;
        document.getElementById("detail-description").innerText = product.moTa || "Chưa có mô tả.";
        
        let imgUrl = "https://placehold.co/500x500?text=No+Image";
        if (product.hinhAnh) {
            imgUrl = product.hinhAnh.startsWith('http') ? product.hinhAnh : `${SERVER_URL}/storage/${product.hinhAnh}`;
        }
        document.getElementById("detail-image").src = imgUrl;
        
        const statusEl = document.getElementById("product-status");
        let isOutOfStock = false;

        if (statusEl) {
            // Kiểm tra số lượng tồn (Nếu null hoặc <= 0 coi như hết hàng)
            const soLuongTon = product.soLuongTon || 0;

            if (soLuongTon > 0) {
                // CÒN HÀNG
                statusEl.innerHTML = `
                    <span class="badge bg-success">Còn hàng</span> 
                    <span class="text-muted ms-2 small">(Tồn kho: ${soLuongTon})</span>`;
                isOutOfStock = false;
            } else {
                // HẾT HÀNG
                statusEl.innerHTML = `
                    <span class="badge bg-danger">Hết hàng</span> 
                    <span class="text-muted ms-2 small">(Tồn kho: 0)</span>`;
                isOutOfStock = true;
            }
        }
        setupDetailAddToCart(product, isOutOfStock); 
        
    } catch (error) { console.error("Lỗi:", error); }
}

// 2. Lấy tính năng (Giữ nguyên)
async function fetchProductFeaturesData(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tinh-nang/xem/${id}`);
        const result = await response.json();
        const list = document.getElementById("detail-features");
        if (list) { 
            list.innerHTML = "";
            if (result.data && result.data.length > 0) {
                result.data.forEach(feature => {
                    list.innerHTML += `<li class="list-group-item bg-transparent ps-0"><i class="fa-solid fa-check text-success me-2"></i> ${feature.tenTinhNang}</li>`;
                });
            } else { list.innerHTML = `<li class="list-group-item bg-transparent ps-0 text-muted">Không có tính năng.</li>`; }
        }
    } catch (error) { console.error("Lỗi tính năng:", error); }
}

// ==========================================
// 3. XỬ LÝ ĐÁNH GIÁ & PHÂN TRANG (QUAN TRỌNG)
// ==========================================

async function fetchProductReviews(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/danh-gia/${id}`);
        const reviews = await response.json();
        
        allReviews = reviews;            // Lưu gốc
        currentFilteredReviews = reviews; // Mặc định hiển thị tất cả
        
        calculateStats(allReviews);

        // Reset về trang 1 và hiển thị
        currentPage = 1;
        renderReviewList(); 

    } catch (error) {
        console.error("Lỗi tải đánh giá:", error);
    }
}

// Hàm hiển thị danh sách (Đã thêm logic cắt trang)
function renderReviewList() {
    const listContainer = document.getElementById("review-list");
    const paginationContainer = document.getElementById("pagination-controls");
    
    if (!listContainer) return;
    listContainer.innerHTML = "";

    // 1. Kiểm tra dữ liệu rỗng
    if (currentFilteredReviews.length === 0) {
        listContainer.innerHTML = `<div class="text-center text-muted py-4">Không tìm thấy đánh giá nào phù hợp.</div>`;
        paginationContainer.innerHTML = ""; // Xóa nút phân trang
        return;
    }

    // 2. Tính toán vị trí cắt mảng (Logic phân trang)
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    
    // Cắt lấy 5 phần tử cho trang hiện tại
    const reviewsToRender = currentFilteredReviews.slice(startIndex, endIndex);

    // 3. Render danh sách đã cắt
    reviewsToRender.forEach(r => {
        const dateObj = new Date(r.ngayDanhGia);
        const dateStr = dateObj.toLocaleDateString('vi-VN');
        const userName = r.user ? r.user.tenNguoiDung : "Ẩn danh";
        const avatarChar = userName.charAt(0).toUpperCase();

        const reviewItem = `
            <div class="d-flex border-bottom pb-3 animate-fade-in">
                <div class="flex-shrink-0">
                    <div class="rounded-circle bg-light text-primary border d-flex align-items-center justify-content-center fw-bold" 
                         style="width: 50px; height: 50px; font-size: 18px;">
                        ${avatarChar}
                    </div>
                </div>
                <div class="flex-grow-1 ms-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="fw-bold mb-0">${userName}</h6>
                        <small class="text-muted">${dateStr}</small>
                    </div>
                    <div class="mb-2 text-warning" style="font-size: 0.9rem;">
                        ${renderStars(r.soSao)}
                    </div>
                    <p class="mb-0 text-secondary">${r.binhLuan || ""}</p>
                </div>
            </div>
        `;
        listContainer.innerHTML += reviewItem;
    });

    // 4. Vẽ nút phân trang
    renderPaginationControls();
}

// Hàm vẽ các nút bấm chuyển trang (1, 2, 3...)
function renderPaginationControls() {
    const container = document.getElementById("pagination-controls");
    const totalPages = Math.ceil(currentFilteredReviews.length / reviewsPerPage);

    container.innerHTML = "";

    // Nếu chỉ có 1 trang thì không cần hiện nút
    if (totalPages <= 1) return;

    let html = `<nav><ul class="pagination">`;

    // Nút lùi (Previous)
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="changePage(${currentPage - 1})">&laquo;</button>
             </li>`;

    // Các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = (i === currentPage) ? 'active' : '';
        html += `<li class="page-item ${activeClass}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                 </li>`;
    }

    // Nút tiến (Next)
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="changePage(${currentPage + 1})">&raquo;</button>
             </li>`;

    html += `</ul></nav>`;
    container.innerHTML = html;
}

// Hàm xử lý khi bấm chuyển trang
window.changePage = function(page) {
    const totalPages = Math.ceil(currentFilteredReviews.length / reviewsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderReviewList(); // Vẽ lại danh sách theo trang mới
};

// Hàm lọc theo số sao
window.filterReviews = function(starLevel, btnElement) {
    // Update UI nút bấm
    const buttons = document.querySelectorAll("#filter-buttons button");
    if(buttons.length > 0) {
        buttons.forEach(btn => {
            btn.classList.remove("active", "btn-dark");
            btn.classList.add("btn-outline-dark");
        });
        btnElement.classList.remove("btn-outline-dark");
        btnElement.classList.add("active", "btn-dark");
    }

    // Logic Lọc
    if (starLevel === 'all') {
        currentFilteredReviews = allReviews;
    } else {
        currentFilteredReviews = allReviews.filter(r => r.soSao == starLevel);
    }

    // QUAN TRỌNG: Khi lọc thì phải reset về trang 1
    currentPage = 1;
    renderReviewList();
};

function calculateStats(reviews) {
    const avgPointEl = document.getElementById("avg-point");
    const avgStarsEl = document.getElementById("avg-stars");
    const totalCountEl = document.getElementById("total-reviews-count");

    if (reviews.length > 0) {
        let totalStars = 0;
        reviews.forEach(r => totalStars += r.soSao);
        const average = (totalStars / reviews.length).toFixed(1); 
        
        if(avgPointEl) avgPointEl.innerText = average;
        if(totalCountEl) totalCountEl.innerText = reviews.length;
        if(avgStarsEl) avgStarsEl.innerHTML = renderStars(Math.round(average)); 
    } else {
        if(avgPointEl) avgPointEl.innerText = "0.0";
        if(totalCountEl) totalCountEl.innerText = "0";
        if(avgStarsEl) avgStarsEl.innerHTML = renderStars(0);
    }
}

function renderStars(soSao) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += (i <= soSao) ? `<i class="fa-solid fa-star"></i>` : `<i class="fa-regular fa-star"></i>`;
    }
    return html;
}

// === GỬI ĐÁNH GIÁ (Giữ nguyên) ===
window.submitReview = async function(event) {
    event.preventDefault(); 
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        alert("Bạn cần đăng nhập để viết đánh giá!");
        if(typeof showPage === 'function') showPage('login'); 
        return;
    }
    const soSao = document.getElementById("input-rating").value;
    const binhLuan = document.getElementById("input-comment").value;

    if (!currentProductId) return;

    try {
        const user = JSON.parse(userJson);
        const response = await fetch(`${API_BASE_URL}/danh-gia/them`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                maSanPham: currentProductId,
                maNguoiDung: user.maNguoiDung,
                soSao: parseInt(soSao),
                binhLuan: binhLuan
            })
        });

        if (response.ok) {
            alert("Cảm ơn bạn đã đánh giá!");
            document.getElementById("form-review").reset();
            fetchProductReviews(currentProductId);
        } else {
            const result = await response.json();
            alert("Lỗi: " + (result.message || "Không thể gửi đánh giá"));
        }
    } catch (error) {
        console.error("Lỗi gửi đánh giá:", error);
    }
};

window.updateDetailQty = function(step) {
    const input = document.getElementById('detail-quantity');
    if (!input) return;
    
    let currentVal = parseInt(input.value) || 1;
    let newVal = currentVal + step;
    
    if (newVal >= 1) {
        input.value = newVal;
    }
};

function setupDetailAddToCart(product, isOutOfStock) {
    const btn = document.getElementById('btn-add-to-cart');
    const qtyInput = document.getElementById('detail-quantity');
    if (!btn || !qtyInput) return;

    // Reset sự kiện
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    // 1. Logic khóa nút khi hết hàng
    if (isOutOfStock) {
        newBtn.disabled = true;
        newBtn.classList.remove('btn-primary');
        newBtn.classList.add('btn-secondary');
        newBtn.innerHTML = '<i class="fa-solid fa-ban me-2"></i> Hết hàng';
        qtyInput.disabled = true;
        qtyInput.value = 0;
        return; // Dừng luôn, không gắn sự kiện click
    } else {
        // Mở lại nút (phòng khi người dùng chuyển từ sp hết hàng sang sp còn hàng mà không load lại trang)
        newBtn.disabled = false;
        newBtn.classList.remove('btn-secondary');
        newBtn.classList.add('btn-primary');
        newBtn.innerHTML = '<i class="fa-solid fa-cart-plus me-2"></i> Thêm vào giỏ hàng';
        qtyInput.disabled = false;
        if(qtyInput.value == 0) qtyInput.value = 1;
    }

    // 2. Sự kiện Click mua hàng (Chỉ chạy khi còn hàng)
    newBtn.addEventListener('click', async function() {
        const token = localStorage.getItem('access_token');
        const quantity = parseInt(qtyInput.value) || 1; 
        
        if (!token) {
            if (typeof showNotification === 'function') {
                showNotification('⚠️ Vui lòng đăng nhập để mua hàng!', 'warning');
            }
            setTimeout(() => { if (typeof showPage === 'function') showPage('login'); }, 1000);
            return;
        }

        this.disabled = true;
        const originalContent = this.innerHTML;
        this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';

        try {
            const res = await fetch(`${API_BASE_URL}/giohang`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    maSanPham: product.maSanPham,
                    soLuong: quantity 
                })
            });

            const result = await res.json();

            if (res.ok && result.success) {
                if (typeof showNotification === 'function') {
                    showNotification(`✓ Đã thêm ${quantity} "${product.tenSanPham}" vào giỏ hàng!`, 'success');
                }
                if (typeof updateCartCount === 'function') updateCartCount();
            } else {
                alert(result.message || 'Lỗi thêm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể kết nối máy chủ');
        } finally {
            this.disabled = false;
            this.innerHTML = originalContent;
        }
    });
}