const bootstrap = window.bootstrap

let mockOrders = [];
let currentOrder = null;

window.loadData = () => {
  fetch(`http://127.0.0.1:8000/api/donhang`, {
      headers: {
          "Accept": "application/json", 
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
      }
  })
  .then(res => {
      if (!res.ok) throw new Error("Server error");
      return res.json();
  })
  .then(result => {
      mockOrders = result.data;
      renderTable(mockOrders);
  }).catch(err => {
      console.error("Lỗi API: ", err);
      const tbody = document.getElementById("order-table-body");
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi máy chủ (500)</td></tr>`;
  });
}

loadData();

// Hàm render giao diện chính của Quản lý đơn hàng
window.renderOrderManagement = () => {
  const subContent = document.getElementById("admin-sub-content")
  if (!subContent) return

  subContent.innerHTML = `
        <div class="card shadow-sm border-0 p-4">
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h3 class="fw-bold mb-0">QUẢN LÝ ĐƠN HÀNG</h3>
                
                <div class="order-toolbar">
                    <input type="text" id="searchOrderId" class="form-control" placeholder="Tìm mã ĐH..." onkeyup="filterOrders()">
                    <input type="text" id="searchUserId" class="form-control" placeholder="Tìm mã người dùng..." onkeyup="filterOrders()">
                    <select id="filterStatus" class="form-select" onchange="filterOrders()">
                        <option value="">Tất cả trạng thái</option>
                        <option value="Chờ duyệt">Chờ duyệt</option>
                        <option value="Đang giao">Đang giao</option>
                        <option value="Đã giao">Đã hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover order-table align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Mã ĐH</th>
                            <th>Mã ND</th>
                            <th>Khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="order-table-body">
                        <!-- Dữ liệu sẽ được render tại đây -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal Chi tiết đơn hàng -->
        <div class="modal fade" id="orderDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-light">
                        <h5 class="modal-title fw-bold">Chi tiết đơn hàng: <span id="modalOrderId"></span></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="modalOrderBody">
                        <!-- Nội dung chi tiết đơn hàng -->
                    </div>
                    <div class="modal-footer" id="modalOrderFooter">
                        <!-- Các nút thao tác sẽ hiển thị ở đây -->
                    </div>
                </div>
            </div>
        </div>
    `

  renderTable(mockOrders)
}

// Hàm render bảng dữ liệu
function renderTable(orders) {
  const tbody = document.getElementById("order-table-body")
  if (!tbody) return

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Không tìm thấy đơn hàng nào.</td></tr>`
    return
  }

  tbody.innerHTML = orders
    .map(
      (order) => `
        <tr onclick="showOrderDetail('${order.id}')">
            <td class="fw-bold text-primary">${order.id}</td>
            <td>${order.userId}</td>
            <td>${order.customer}</td>
            <td>${formatDateTime(order.date)}</td>
            <td>${order.total.toLocaleString()}đ</td>
            <td>${getStatusBadge(order.status)}</td>
            <td onclick="event.stopPropagation()">
                ${renderActionButtons(order.status, order.id, false)}
            </td>
        </tr>
    `,
    )
    .join("")
}

// Hàm lấy badge cho trạng thái
function getStatusBadge(status) {
  switch (status) {
    case "Chờ duyệt":
      return `<span class="badge bg-warning text-dark">${status}</span>`
    case "Đang giao":
      return `<span class="badge bg-info text-dark">${status}</span>`
    case "Đã hoàn thành":
      return `<span class="badge bg-success">${status}</span>`
    case "Đã hủy":
      return `<span class="badge bg-danger">${status}</span>`
    default:
      return status
  }
}

// Hàm render các nút thao tác dựa trên trạng thái
function renderActionButtons(status, orderId, fromModal = false) {
  if (status === "Chờ duyệt") {
    return `
            <button class="btn btn-sm btn-success btn-action" onclick="handleAction('approve', '${orderId}', ${fromModal})">Duyệt</button>
            <button class="btn btn-sm btn-danger btn-action" onclick="handleAction('cancel', '${orderId}', ${fromModal})">Hủy</button>
        `
  } else if (status === "Đang giao") {
    return `
            <button class="btn btn-sm btn-danger btn-action" onclick="handleAction('cancel', '${orderId}', ${fromModal})">Hủy</button>
        `
  }
  return "" // Các trường hợp khác không hiển thị nút
}

// Hàm lọc đơn hàng
window.filterOrders = () => {
  const orderId = document.getElementById("searchOrderId").value.toLowerCase()
  const userId = document.getElementById("searchUserId").value.toLowerCase()
  const status = document.getElementById("filterStatus").value

  const filtered = mockOrders.filter((o) => {
    return (
      String(o.id).toLowerCase().includes(orderId) &&
      String(o.userId).toLowerCase().includes(userId) &&
      (status === "" || o.status === status)
    )
  })

  renderTable(filtered)
}

// Hàm hiển thị chi tiết đơn hàng
window.showOrderDetail = (orderId) => {
  const order = mockOrders.find((o) => String(o.id) === String(orderId))
  currentOrder = order;
  if (!order) return

  document.getElementById("modalOrderId").innerText = order.id

  const detailsHtml = `
        <div class="mb-3 d-flex justify-content-between">
            <div><strong>Khách hàng:</strong> ${order.customer}</div>
            <div><strong>Trạng thái:</strong> ${getStatusBadge(order.status)}</div>
        </div>
        <div class="table-responsive">
            <table class="table align-middle">
                <thead>
                    <tr class="small text-muted">
                        <th style="width: 60px">Ảnh</th>
                        <th>Sản phẩm</th>
                        <th class="text-center">SL</th>
                        <th class="text-end">Đơn giá</th>
                        <th class="text-end">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.details
                      .map(
                        (item) => `
                        <tr>
                            <td><img src="${item.img}" class="order-detail-img" alt="${item.name}"></td>
                            <td>${item.name}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-end">${item.price.toLocaleString()}đ</td>
                            <td class="text-end">${(item.quantity * item.price).toLocaleString()}đ</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
        <div class="order-summary text-end">
            <h5 class="mb-0 fw-bold">Tổng cộng: <span class="text-danger">${order.total.toLocaleString()}đ</span></h5>
        </div>
    `

  document.getElementById("modalOrderBody").innerHTML = detailsHtml
  document.getElementById("modalOrderFooter").innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        ${renderActionButtons(order.status, order.id, true)}
    `

  const modal = new bootstrap.Modal(document.getElementById("orderDetailModal"))
  modal.show()
}

// Hàm xử lý các nút bấm
window.handleAction = async (action, id, fromModal = false) => {
  event.stopPropagation() 
  let trangThai = '';
  if(action === 'approve') {
    trangThai = 'Đang giao';
    if(!confirm(`Duyệt đơn hàng ${id}`)) return;
  } else if(action === 'cancel') {
    trangThai = 'Đã hủy';
    if(!confirm(`Hủy đơn hàng ${id}`)) return;
  }

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
    if(data.status) {
      alert(data.message);

      loadData();
      filterOrders();

      if(fromModal && currentOrder) {
        const modalEl = document.getElementById("orderDetailModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);

        if (modalInstance) {
          modalInstance.hide();
        }

        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("padding-right");
      } 
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối server");
  }
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);

  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

