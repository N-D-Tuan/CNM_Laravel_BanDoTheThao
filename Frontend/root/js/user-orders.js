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

  let actionButton = "";
  if (order.status === "Chờ duyệt") {
    actionButton = `
      <button class="btn btn-outline-danger btn-sm px-4 rounded-pill" onclick="event.stopPropagation(); handleUserCancelOrder('${order.id}')">
          Hủy đơn hàng
      </button>`;
  } else if (order.status === "Đã giao") {
    actionButton = `
      <button class="btn btn-outline-primary btn-sm px-4 rounded-pill" onclick="event.stopPropagation(); showEvaluationModal('${order.id}')">
          Đánh giá sản phẩm
      </button>`;
  }

  return `
        <div class="card mb-3 border-0 shadow-sm user-order-card" onclick="showUserOrderDetail('${order.id}')">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <span class="fw-bold">Mã: <span class="text-primary">${order.id}</span></span>
                <span class="status-badge status-${order.status.toLowerCase().replace(" ", "-")}">${order.status}</span>
            </div>
            <div class="card-body">
                <div class="d-flex gap-3">
                    <img src="${firstItem.img}" class="rounded shadow-sm" style="width: 75px; height: 75px; object-fit: cover;">
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

window.showEvaluationModal = (id) => {
    alert("Chức năng đánh giá cho đơn hàng " + id + " đang được phát triển.");
    // Bạn có thể showPage('danh-gia') hoặc mở modal đánh giá tại đây
}