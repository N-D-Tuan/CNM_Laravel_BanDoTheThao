window.userOrders = []

window.loadUserOrders = async () => {
  const userLocal = localStorage.getItem("user")
  const token = localStorage.getItem("access_token")

  if (!userLocal) return

  const user = JSON.parse(userLocal)
  const userId = user.maNguoiDung

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/donhang/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Gửi kèm token để xác thực
        'Accept': 'application/json'
      }
    })
    
    if (!res.ok) throw new Error("Lỗi server")
    
    const json = await res.json()
    if (json.status) {
      window.userOrders = json.data
      window.renderUserOrders("Tất cả") 
    }
  } catch (err) {
    console.error("Lỗi load đơn hàng:", err)
  }
}

if (typeof window.bootstrap === "undefined") {
  window.bootstrap = window.bootstrap || {}
}

window.renderUserOrders = (filterStatus = "Tất cả", activeTab = null) => {
  const listContainer = document.getElementById("user-order-list")

  if (!listContainer) {
    setTimeout(() => window.renderUserOrders(filterStatus, activeTab), 150)
    return
  }

  if (activeTab) {
    const tabs = document.querySelectorAll("#order-status-tabs .nav-link")
    tabs.forEach((tab) => tab.classList.remove("active"))
    activeTab.classList.add("active")
  }

  const filtered =
    filterStatus === "Tất cả" ? window.userOrders : window.userOrders.filter((o) => o.status === filterStatus)

  if (filtered.length === 0) {
    listContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-box-seam display-1 text-muted opacity-25"></i>
                <p class="text-muted mt-3">Không có đơn hàng nào ở trạng thái "${filterStatus}"</p>
            </div>`
    return
  }

  listContainer.innerHTML = filtered.map((order) => renderUserOrderCard(order)).join("")
}

function renderUserOrderCard(order) {
  const firstItem = order.items[0]
  const otherCount = order.items.length - 1

  const imgSrc = firstItem.img 
            ? (firstItem.img.startsWith('http') ? firstItem.img : `http://127.0.0.1:8000/storage/${firstItem.img}`) 
            : 'https://via.placeholder.com/300';


  let actionButton = "";
  if (order.status === "Chờ duyệt") {
    actionButton = `
      <button class="btn btn-outline-danger btn-sm px-4 rounded-pill" onclick="event.stopPropagation(); handleUserCancelOrder('${order.id}')">
          Hủy đơn hàng
      </button>`;
  } else if (order.status === "Đã giao") {
    if (order.is_rated) {
        // Nếu đã đánh giá => Hiện nút Mua lại
        actionButton = `
          <button class="btn btn-secondary btn-sm px-4 rounded-pill" onclick="event.stopPropagation(); handleBuyAgain('${order.id}')">
              <i class="bi bi-cart-plus"></i> Mua lại
          </button>`;
    } else {
        // Nếu chưa đánh giá => Hiện nút Đánh giá
        actionButton = `
          <button class="btn btn-outline-primary btn-sm px-4 rounded-pill" onclick="event.stopPropagation(); showEvaluationModal('${order.id}')">
              Đánh giá sản phẩm
          </button>`;
    }
  }

  return `
        <div class="card mb-3 border-0 shadow-sm user-order-card" onclick="showUserOrderDetail('${order.id}')">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <span class="fw-bold">Mã: <span class="text-primary">${order.id}</span></span>
                <span class="status-badge status-${order.status.toLowerCase().replace(" ", "-")}">${order.status}</span>
            </div>
            <div class="card-body">
                <div class="d-flex gap-3">
                    <img src="${imgSrc}" class="rounded shadow-sm" style="width: 75px; height: 75px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <div class="fw-bold mb-1">${firstItem.name}</div>
                        <div class="text-muted small">Số lượng: ${firstItem.qty}</div>
                        ${otherCount > 0 ? `<div class="text-muted small">+ ${otherCount} sản phẩm khác</div>` : ""}
                    </div>
                    <div class="text-end">
                        <div class="text-muted small mb-1">Thành tiền</div>
                        <div class="fw-bold text-danger">${order.total.toLocaleString()}đ</div>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-white border-top-dashed d-flex justify-content-between align-items-center py-3">
              <div>
                <span class="text-muted small" style='margin-right: 20px;'><i class="bi bi-clock me-1"></i>${order.date}</span>
                <span class="text-muted small";></i><span style='font-weight: bold'>Địa điểm nhận hàng:</span> ${order.address}</span>
              </div>
              ${actionButton}
            </div>
        </div>
    `
}

window.filterByStatus = (status, element) => {
  window.renderUserOrders(status, element)
}

window.filterUserOrders = () => {
  const term = document.getElementById("user-order-search").value.toLowerCase()
  const filtered = window.userOrders.filter((o) => o.id.toLowerCase().includes(term))
  const listContainer = document.getElementById("user-order-list")
  if (listContainer) {
    listContainer.innerHTML =
      filtered.length > 0
        ? filtered.map((o) => renderUserOrderCard(o)).join("")
        : '<p class="text-center py-5 text-muted">Không tìm thấy đơn hàng phù hợp</p>'
  }
}

window.showUserOrderDetail = (id) => {
  const order = window.userOrders.find((o) => String(o.id) === id)
  if (!order) return

  const modalBody = document.getElementById("userOrderDetailBody")
  const modalFooter = document.getElementById("userOrderDetailFooter")

  modalBody.innerHTML = `
        <div class="order-detail-header p-3 border-bottom mb-3">
            <div class="row">
                <div class="col-6">
                    <div class="text-muted small">Mã đơn hàng</div>
                    <div class="fw-bold">${order.id}</div>
                </div>
                <div class="col-6 text-end">
                    <div class="text-muted small">Ngày đặt</div>
                    <div>${order.date}</div>
                </div>
            </div>
        </div>
        <div class="px-3 pb-3">
            <div class="fw-bold mb-3 text-uppercase small text-muted">Sản phẩm</div>
            ${order.items
      .map(
        (item) => `
                <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom-light">
                    <img src="${item.img}" class="rounded border" style="width: 55px; height: 55px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <div class="fw-bold small">${item.name}</div>
                        <div class="text-muted extra-small">${item.price.toLocaleString()}đ x ${item.qty}</div>
                    </div>
                    <div class="fw-bold text-dark">${(item.qty * item.price).toLocaleString()}đ</div>
                </div>
            `,
      )
      .join("")}
            <div class="d-flex justify-content-between align-items-center mt-4">
                <span class="h5 mb-0 fw-bold">Tổng thanh toán:</span>
                <span class="h3 mb-0 fw-bold text-danger">${order.total.toLocaleString()}đ</span>
            </div>
        </div>
    `

  let footerHtml = "";
  if (order.status === "Chờ duyệt") {
    footerHtml = `<button class="btn btn-danger w-100 py-2 fw-bold" onclick="handleUserCancelOrder('${order.id}')">HỦY ĐƠN HÀNG</button>`;
  } else if (order.status === "Đang giao") {
    footerHtml = `<button class="btn btn-success w-100 py-2 fw-bold" onclick="handleConfirmReceived('${order.id}')">ĐÃ NHẬN ĐƯỢC HÀNG</button>`;
  } else {
    footerHtml = `<button class="btn btn-secondary w-100 py-2" data-bs-dismiss="modal">Đóng</button>`;
  }

  modalFooter.innerHTML = footerHtml;
  
  const bootstrap = window.bootstrap
  const myModal = new bootstrap.Modal(document.getElementById("userOrderDetailModal"))
  myModal.show()
}

window.handleUserCancelOrder = async (id) => {
  if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${id}?`)) {
    let trangThai = 'Đã hủy';

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/donhang/${id}/trangthai`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          trangThai: trangThai
        })
      });

      const data = await res.json();
      if (data.status) {
        alert(data.message);

        setTimeout(async () => {
            if (window.loadUserOrders) {
            await window.loadUserOrders()
            }

            if (window.renderUserOrders) {
            window.renderUserOrders("Tất cả")
            }
        }, 0)
        const modal = window.bootstrap.Modal.getInstance(document.getElementById("userOrderDetailModal"))
        if (modal) modal.hide()
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server");
    }
  }
}

window.handleConfirmReceived = async (id) => {
  if (confirm(`Bạn xác nhận đã nhận được đơn hàng số ${id}?`)) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/donhang/${id}/trangthai`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          trangThai: "Đã giao"
        })
      });

      const data = await res.json();
      if (data.status) {
        alert("Cảm ơn bạn đã xác nhận nhận hàng!");
        
        await window.loadUserOrders();
        window.renderUserOrders("Tất cả");

        const modal = window.bootstrap.Modal.getInstance(document.getElementById("userOrderDetailModal"));
        if (modal) modal.hide();
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server khi cập nhật trạng thái");
    }
  }
}

// Biến toàn cục tạm để lưu ID đơn hàng đang đánh giá
let currentRatingOrderId = null;

// 1. Hiển thị Modal đánh giá
window.showEvaluationModal = (orderId) => {
    // Tìm đơn hàng trong danh sách đã tải
    const order = window.userOrders.find((o) => String(o.id) === String(orderId));
    if (!order) return;

    currentRatingOrderId = orderId;
    const modalBody = document.getElementById("ratingModalBody");
    
    // === SỬA: Log dữ liệu ra console để kiểm tra ===
    console.log("Dữ liệu đơn hàng đang đánh giá:", order);
    console.log("Danh sách sản phẩm (items):", order.items);

    const html = order.items.map(item => {
        // === SỬA: Thử lấy ID bằng nhiều cách và log nếu thiếu ===
        // Bạn hãy mở Console (F12) xem nó in ra cái gì nếu bị undefined
        const productId = item.maSanPham || item.product_id || item.id; 
        
        if (!productId) {
            console.error("CẢNH BÁO: Không tìm thấy ID sản phẩm trong item này:", item);
            console.warn("Vui lòng kiểm tra API DonHangController xem đã select cột 'maSanPham' chưa.");
        }

        return `
            <div class="card mb-3 border-0 shadow-sm rating-item" data-product-id="${productId}">
                <div class="card-body d-flex gap-3">
                    <img src="${item.img}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="fw-bold mb-1">${item.name}</h6>
                        
                        <div class="mb-2 star-rating-container">
                            <i class="bi bi-star text-warning fs-4 cursor-pointer" onclick="selectStar(this, 1)"></i>
                            <i class="bi bi-star text-warning fs-4 cursor-pointer" onclick="selectStar(this, 2)"></i>
                            <i class="bi bi-star text-warning fs-4 cursor-pointer" onclick="selectStar(this, 3)"></i>
                            <i class="bi bi-star text-warning fs-4 cursor-pointer" onclick="selectStar(this, 4)"></i>
                            <i class="bi bi-star text-warning fs-4 cursor-pointer" onclick="selectStar(this, 5)"></i>
                            <input type="hidden" class="rating-value" value="5"> </div>

                        <textarea class="form-control rating-comment" rows="2" placeholder="Chất lượng sản phẩm thế nào? (Không bắt buộc)"></textarea>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    modalBody.innerHTML = html;

    // Khởi tạo mặc định 5 sao (tô màu vàng)
    document.querySelectorAll('.rating-item').forEach(item => {
        const stars = item.querySelectorAll('.bi-star');
        // Vì mặc định value=5 nên tô vàng hết
        stars.forEach(s => {
            s.classList.remove('bi-star');
            s.classList.add('bi-star-fill');
        });
    });

    const bootstrap = window.bootstrap;
    const myModal = new bootstrap.Modal(document.getElementById("ratingModal"));
    myModal.show();
}

// 2. Xử lý click chọn sao (Giữ nguyên, chỉ đảm bảo logic đúng)
window.selectStar = (starElement, value) => {
    const container = starElement.parentElement;
    const stars = container.querySelectorAll('i');
    const input = container.querySelector('.rating-value');

    input.value = value;

    stars.forEach((s, index) => {
        if (index < value) {
            s.classList.remove('bi-star');
            s.classList.add('bi-star-fill'); // Sao đặc
        } else {
            s.classList.remove('bi-star-fill');
            s.classList.add('bi-star'); // Sao rỗng
        }
    });
}

// 3. Gửi đánh giá lên Server
window.submitProductReviews = async () => {
    const userLocal = localStorage.getItem("user");
    if (!userLocal) {
        alert("Vui lòng đăng nhập lại.");
        return;
    }
    const user = JSON.parse(userLocal);
    const userId = user.maNguoiDung;

    const ratingItems = document.querySelectorAll(".rating-item");
    const reviews = [];
    let hasError = false;

    // Duyệt qua form để lấy dữ liệu
    ratingItems.forEach(item => {
        const productId = item.getAttribute("data-product-id");
        const soSao = item.querySelector(".rating-value").value;
        const binhLuan = item.querySelector(".rating-comment").value.trim();

        // === SỬA: Kiểm tra chặt chẽ ID sản phẩm ===
        if (!productId || productId === "undefined" || productId === "null") {
            hasError = true;
            return;
        }

        reviews.push({
            maNguoiDung: parseInt(userId),
            maSanPham: productId, 
            soSao: parseInt(soSao),
            binhLuan: binhLuan
        });
    });

    if (hasError) {
        alert("Lỗi: Không tìm thấy ID sản phẩm. Vui lòng F12 -> Console để xem chi tiết lỗi API.");
        return;
    }

    if (reviews.length === 0) return;

    if(!confirm("Gửi đánh giá cho " + reviews.length + " sản phẩm?")) return;

    let successCount = 0;
    let failMessages = [];

    // Gửi từng request
    for (const review of reviews) {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/danh-gia/them", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(review)
            });
            
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                successCount++;
            } else {
                console.error("Lỗi server trả về:", data);
                failMessages.push(data.message || "Lỗi không xác định");
            }
        } catch (err) {
            console.error("Lỗi mạng:", err);
            failMessages.push("Lỗi kết nối");
        }
    }

    if (successCount > 0) {
        alert(`Thành công! Đã gửi ${successCount} đánh giá.`);
        const modal = window.bootstrap.Modal.getInstance(document.getElementById("ratingModal"));
        if(modal) modal.hide();
    } 
    
    if (failMessages.length > 0) {
        alert("Có lỗi xảy ra:\n" + failMessages.join("\n"));
    }
}

window.handleBuyAgain = async (orderId) => {
  const userLocal = localStorage.getItem("user");
  const token = localStorage.getItem("access_token"); // Lấy token để xác thực
  if (!userLocal || !token) {
      alert("Vui lòng đăng nhập lại.");
      return;
  }
  
  // 1. Lấy thông tin đơn hàng
  const order = window.userOrders.find((o) => String(o.id) === String(orderId));
  if (!order || !order.items || order.items.length === 0) return;

  if (!confirm(`Thêm ${order.items.length} sản phẩm vào giỏ hàng?`)) return;

  // 2. Chuẩn bị dữ liệu gửi đi (Format đúng theo Backend yêu cầu)
  const itemsToSend = order.items.map(item => ({
      maSanPham: item.maSanPham || item.product_id, // Lấy đúng ID
      soLuong: 1 // Mặc định mua lại số lượng 1 (hoặc để item.qty nếu muốn)
  }));

  try {
      // 3. Gọi API thêm nhiều (Chỉ 1 request duy nhất)
      const res = await fetch("http://127.0.0.1:8000/api/gio-hang/them-nhieu", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ items: itemsToSend })
      });

      const data = await res.json();

      if (data.success) {
          alert(data.message);
          // Nếu có cảnh báo (ví dụ hết hàng) thì hiện thêm
          if (data.warnings && data.warnings.length > 0) {
              alert("Lưu ý:\n" + data.warnings.join("\n"));
          }
          //window.location.href = "cart.html"; // Chuyển trang
      } else {
          alert("Lỗi: " + data.message);
      }
  } catch (error) {
      console.error("Lỗi mua lại:", error);
      alert("Lỗi kết nối server.");
  }
}