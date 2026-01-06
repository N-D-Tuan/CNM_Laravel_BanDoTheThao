<?php

use App\Http\Controllers\DonHangController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DanhGiaController;
use App\Http\Controllers\SanPhamController;
use App\Http\Controllers\DanhMucController;
use App\Http\Controllers\TinhNangController;
use App\Http\Controllers\GioHangController;
use App\Http\Controllers\DanhMucSanPhamController;
use App\Http\Controllers\VNPayController;

Route::post('/danh-gia/them', [DanhGiaController::class, 'store']);
// 👇 Đổi 'api' thành 'sanctum'
Route::post('/gio-hang/them-nhieu', [GioHangController::class, 'addMultiple'])->middleware('auth:sanctum');
Route::get('/tinh-nang/xem/{id}', [TinhNangController::class, 'xemTinhNang']);

Route::post('/danh-gia', [DanhGiaController::class, 'store']);
Route::get('/danh-gia/{maSanPham}', [DanhGiaController::class, 'index']);
Route::get('/danh-muc', [DanhMucController::class, 'index']);
Route::post('/danh-muc', [DanhMucController::class, 'store']);
Route::put('/danh-muc/{id}', [DanhMucController::class, 'update']);
Route::delete('/danh-muc/{id}', [DanhMucController::class, 'destroy']);

Route::get('/san-pham', [SanPhamController::class, 'index']);

Route::get('/san-pham/danh-muc/{id}', [SanPhamController::class, 'getByDanhMuc']);
Route::get('/san-pham/filter', [SanPhamController::class, 'filter']);
Route::get('/san-pham/{id}', [SanPhamController::class, 'show']);
Route::post('/san-pham', [SanPhamController::class, 'store']);
Route::put('/san-pham/{id}', [SanPhamController::class, 'update']);
Route::delete('/san-pham/{id}', [SanPhamController::class, 'destroy']);

Route::post('/san-pham/nhap-kho', [SanPhamController::class, 'nhapKho']);
Route::post('/san-pham/xuat-kho', [SanPhamController::class, 'xuatKho']);
//Lấy toàn bộ đơn hàng cho admin
Route::get('/donhang', [DonHangController::class, 'index']);

//lấy đơn hàng theo user
Route::get('/donhang/user/{id}', [DonHangController::class, 'getByUser']);

//lấy đơn hàng theo mã đơn hàng
Route::get('/donhang/{id}', [DonHangController::class, 'getByMaDonHang']);

// Cập nhật trạng thái đơn hàng
Route::put('/donhang/{id}/trangthai', [DonHangController::class, 'updateTrangThai']);
Route::post('/tinh-nang', [TinhNangController::class, 'themTinhNang']);
Route::get('/tinh-nang/{maSanPham}', [TinhNangController::class, 'xemTinhNang']);
Route::put('/tinh-nang/{maTinhNang}', [TinhNangController::class, 'suaTinhNang']);
Route::delete('/tinh-nang/{maTinhNang}', [TinhNangController::class, 'xoaTinhNang']);
Route::get('/tinh-nang', [TinhNangController::class, 'xemTatCaTinhNang']);

Route::get('/vnpay-return', [VNPayController::class, 'vnpayReturn']);
// ==================== ROUTES GIỎ HÀNG (CẦN ĐĂNG NHẬP) ====================
Route::middleware('auth:sanctum')->group(function () {
    //Thanh toán VNPay
    Route::post('/vnpay/create', [VNPayController::class, 'createPayment']);

    // Giỏ hàng
    Route::get('/giohang/count', [GioHangController::class, 'count']);
    Route::get('/giohang', [GioHangController::class, 'index']);           
    Route::post('/giohang', [GioHangController::class, 'store']);        
    Route::put('/giohang/{maSanPham}', [GioHangController::class, 'update']);
    Route::delete('/giohang/{maSanPham}', [GioHangController::class, 'destroy']);
    Route::delete('/giohang', [GioHangController::class, 'clear']);
    
    // Đơn hàng
    Route::get('/donhang', [DonHangController::class, 'index']);
    Route::post('/donhang', [DonHangController::class, 'store']);
    Route::get('/donhang/user/{id}', [DonHangController::class, 'getByUser']);
    Route::get('/donhang/{id}', [DonHangController::class, 'getByMaDonHang']);
    Route::put('/donhang/{id}/trangthai', [DonHangController::class, 'updateTrangThai']);
});
// Routes cho Danh mục sản phẩm
Route::get('/danhmucsanpham', [DanhMucSanPhamController::class, 'index']);        
Route::get('/danhmucsanpham/{id}', [DanhMucSanPhamController::class, 'show']);  
Route::post('/danhmucsanpham', [DanhMucSanPhamController::class, 'store']); 
Route::put('/danhmucsanpham/{id}', [DanhMucSanPhamController::class, 'update']); 
Route::delete('/danhmucsanpham/{id}', [DanhMucSanPhamController::class, 'destroy']);
Route::prefix('users')->group(function () {
    // --- NHÓM 1: CÔNG KHAI (Public Routes) ---
    Route::post('/login', [UserController::class, 'login'])->name('login');
    Route::post('/register', [UserController::class, 'register']); 
    Route::post('/send-otp', [UserController::class, 'sendOtp']); 
    Route::post('/forgot-password', [UserController::class, 'forgotPassword']); 

    // --- NHÓM 2: CẦN ĐĂNG NHẬP (Protected Routes) ---
    // Sử dụng Middleware 'auth:sanctum' để bảo vệ các API này
    Route::middleware('auth:sanctum')->group(function () {
               
        // Đăng xuất
        Route::post('/logout', [UserController::class, 'logout']);
        
        // Đổi mật khẩu
        Route::post('/send-otp-change-password', [UserController::class, 'sendOtpForChangePassword']);
        Route::post('/change-password', [UserController::class, 'changePassword']);

        // Thông tin cá nhân
        Route::put('/profile/{id}', [UserController::class, 'updateProfile']);
        
        // Quản lý Admin
        Route::get('/stats', [UserController::class, 'getUserStats']);
        Route::get('/deleted-list', [UserController::class, 'showDeleted']);
        Route::post('/restore/{id}', [UserController::class, 'restoreUser']);
        Route::put('/admin-edit/{id}', [UserController::class, 'adminUpdateUser']);
        
        // Tra cứu User
        Route::get('/all', [UserController::class, 'showAll']);         
        Route::get('/search', [UserController::class, 'showByName']);  
        Route::get('/{id}', [UserController::class, 'showId']);         
        Route::delete('/{id}', [UserController::class, 'softDelete']); 
    }); 
});
