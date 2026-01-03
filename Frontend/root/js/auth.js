async function handleLogin() {
    const email = document.getElementById('email').value;
    const matKhau = document.getElementById('password').value;
    const alertDiv = document.getElementById('login-alert');

    console.log("--- Bắt đầu quá trình Đăng nhập ---");
    console.log("Dữ liệu gửi đi:", { email, matKhau });

    alertDiv.classList.add('d-none');
    alertDiv.classList.remove('alert-danger', 'alert-success');

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, matKhau })
        });

        console.log("Trạng thái HTTP Response:", response.status);
        const data = await response.json();
        console.log("Dữ liệu nhận về từ Backend:", data);

        if (response.ok) {
            console.log("Đăng nhập thành công! Đang lưu vào localStorage...");
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('access_token', data.access_token);

            alertDiv.innerText = "Đăng nhập thành công! Đang chuyển hướng...";
            alertDiv.classList.remove('d-none');
            alertDiv.classList.add('alert-success');

            setTimeout(() => {
                console.log("Đang chuyển về trang chủ và vẽ lại Header...");
                showPage('trang-chu');
                renderHeader();
            }, 1000);

        } else {
            console.warn("Đăng nhập thất bại:", data.message);
            alertDiv.innerText = data.message || "Email hoặc mật khẩu không chính xác!";
            alertDiv.classList.remove('d-none');
            alertDiv.classList.add('alert-danger');
        }
    } catch (error) {
        console.error("LỖI KẾT NỐI SERVER:", error);
        alertDiv.innerText = "Lỗi kết nối đến Server!";
        alertDiv.classList.remove('d-none');
        alertDiv.classList.add('alert-danger');
    }
}

async function handleLogout() {
    const token = localStorage.getItem('access_token');
    await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    localStorage.clear();
    location.reload();
}


window.togglePassword = function() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (!passwordField || !toggleIcon) return;

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    }
};

window.toggleNewPassword = function() {
    const passwordField = document.getElementById('cp-new-password');
    const toggleIcon = document.getElementById('toggleIconNew');
    
    if (!passwordField || !toggleIcon) return;

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.replace('bi-eye-slash', 'bi-eye');
    }
};

window.handleRegister = async function() {
    const tenNguoiDung = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const soDienThoai = document.getElementById('reg-phone').value;
    const matKhau = document.getElementById('reg-password').value;
    const alertDiv = document.getElementById('register-alert');

    alertDiv.classList.add('d-none');

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ tenNguoiDung, email, soDienThoai, matKhau })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            showPage('login');
        } else {
            alertDiv.classList.remove('d-none');
            alertDiv.className = "alert alert-danger py-2 small";

            if (data.errors) {
                const firstErrorKey = Object.keys(data.errors)[0];
                alertDiv.innerText = data.errors[firstErrorKey][0];
            } else {
                alertDiv.innerText = data.message || "Đăng ký thất bại, vui lòng kiểm tra lại.";
            }
        }
    } catch (e) { console.error(e); }
};

window.handleSendOtp = async function() {
    const email = document.getElementById('forgot-email').value;
    const alertDiv = document.getElementById('forgot-alert');

    try {
        const response = await fetch(`${API_URL}/users/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok) {
            alert("Mã OTP đã gửi về Email của bạn!");
            sessionStorage.setItem('reset_email', email);
            showPage('reset-password');
        } else {
            alertDiv.innerText = data.message;
            alertDiv.className = "alert alert-danger py-2 small";
            alertDiv.classList.remove('d-none');
        }
    } catch (e) { console.error(e); }
};

window.handleResetPassword = async function() {
    const email = sessionStorage.getItem('reset_email'); 
    const otp = document.getElementById('otp-code').value;
    const matKhauMoi = document.getElementById('new-password').value;
    const alertDiv = document.getElementById('reset-alert');

    try {
        const response = await fetch(`${API_URL}/users/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, otp, matKhauMoi })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
            sessionStorage.removeItem('reset_email');
            showPage('login');
        } else {
            alertDiv.innerText = data.message || "Mã OTP không đúng hoặc hết hạn";
            alertDiv.className = "alert alert-danger py-2 small";
            alertDiv.classList.remove('d-none');
        }
    } catch (e) { console.error(e); }
};

window.handleUpdateProfile = async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('access_token');
    const alertDiv = document.getElementById('profile-alert');

    const updatedData = {
        tenNguoiDung: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        soDienThoai: document.getElementById('profile-phone').value
    };

    try {
        const response = await fetch(`${API_URL}/users/profile/${user.maNguoiDung}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.data));
            
            alertDiv.className = "alert alert-success py-2 small";
            alertDiv.innerText = "Cập nhật hồ sơ thành công!";
            alertDiv.classList.remove('d-none');
            
            renderHeader();

            setTimeout(() => {
                showPage('trang-chu');
            }, 1500);
        } else {
            alertDiv.className = "alert alert-danger py-2 small";
            alertDiv.innerText = data.message || "Cập nhật thất bại!";
            alertDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alertDiv.innerText = "Không thể kết nối đến máy chủ";
        alertDiv.classList.remove('d-none');
    }
};

window.requestOtp = async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('access_token');
    const oldPass = document.getElementById('password').value;
    const newPass = document.getElementById('cp-new-password').value;
    const alertDiv = document.getElementById('cp-alert');

    if (!oldPass) {
        alertDiv.className = "alert alert-warning py-2 small";
        alertDiv.innerText = "Vui lòng nhập mật khẩu cũ";
        alertDiv.classList.remove('d-none');
        return;
    }

    if (!newPass || newPass.trim() === "") {
        alertDiv.className = "alert alert-warning py-2 small";
        alertDiv.innerText = "Vui lòng nhập mật khẩu mới";
        alertDiv.classList.remove('d-none');
        return;
    }

    if (newPass.length < 6) {
        alertDiv.className = "alert alert-warning py-2 small";
        alertDiv.innerText = "Mật khẩu mới phải có ít nhất 6 ký tự";
        alertDiv.classList.remove('d-none');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/send-otp-change-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                matKhauCu: oldPass 
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('step-1').classList.add('d-none');
            document.getElementById('step-2').classList.remove('d-none');
            
            alertDiv.className = "alert alert-info py-2 small";
            alertDiv.innerText = "Mã OTP đã gửi! Vui lòng kiểm tra email.";
            alertDiv.classList.remove('d-none');
        } else {
            alertDiv.className = "alert alert-danger py-2 small";
            alertDiv.innerText = data.message;
            alertDiv.classList.remove('d-none');
        }
    } catch (e) {
        console.error(e);
    }
};

window.finalizeChangePassword = async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('access_token');
    const matKhauCu = document.getElementById('password').value;
    const matKhauMoi = document.getElementById('cp-new-password').value;
    const otp = document.getElementById('cp-otp').value;
    const alertDiv = document.getElementById('cp-alert');

    try {
        const response = await fetch(`${API_URL}/users/change-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                email: user.email,
                matKhauCu: matKhauCu,
                matKhauMoi: matKhauMoi,
                otp: otp
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Đổi mật khẩu thành công!");
            setTimeout(() => {
                showPage('trang-chu');
            }, 1500);
        } else {
            alertDiv.className = "alert alert-danger py-2 small";
            alertDiv.innerText = data.message;
        }
    } catch (e) {
        console.error(e);
    }
};