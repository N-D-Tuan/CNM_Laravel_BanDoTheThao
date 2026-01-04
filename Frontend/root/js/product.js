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
        grid.innerHTML = `<div class="col-12"><p class="text-center text-muted">Không tìm thấy sản phẩm nào</p></div>`;
        return;
    }

    products.forEach(p => {
        const priceFormatted = Number(p.giaBan).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        
        // SỬA LẠI ĐOẠN NÀY:
        // Thay imgUrl bằng logic của bạn
        const imgSrc = p.hinhAnh 
            ? (p.hinhAnh.startsWith('http') ? p.hinhAnh : `http://127.0.0.1:8000/storage/${p.hinhAnh}`) 
            : 'https://via.placeholder.com/300';

        grid.innerHTML += `
            <div class="product-card">
                <a href="#" onclick="showProductDetail(${p.maSanPham}); return false;" class="d-block">
                    <img src="${imgSrc}" class="img-fluid" style="width:100%; height: 250px; object-fit: cover;">
                </a>
                
                <div class="card-body text-center">
                    <h5>
                        <a href="#" onclick="showProductDetail(${p.maSanPham}); return false;" class="text-decoration-none text-dark fw-bold">
                            ${p.tenSanPham}
                        </a>
                    </h5>
                    
                    <p class="text-success fw-bold">
                        ${priceFormatted}
                    </p>
                    
                    <button class="btn btn-primary w-100">Thêm vào giỏ</button>
                </div>
            </div>
        `;
    });
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

            // bỏ chọn → reset giá
            if (!this.checked) {
                filters.minPrice = null;
                filters.maxPrice = null;
                reloadProducts();
                return;
            }

            // chỉ cho phép 1 checkbox
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

    // Click tìm kiếm
    searchBtn.addEventListener('click', () => {
        filters.keyword = searchInput.value.trim();
        filters.page = 1;
        reloadProducts();
    });

    // Nhấn Enter
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
}

document.addEventListener('DOMContentLoaded', initProductPage);
