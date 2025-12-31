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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/danh-gia', [DanhGiaController::class, 'store']);
Route::get('/danh-gia/{maSanPham}', [DanhGiaController::class, 'index']);
Route::get('/danh-muc', [DanhMucController::class, 'index']);
Route::post('/danh-muc', [DanhMucController::class, 'store']);
Route::put('/danh-muc/{id}', [DanhMucController::class, 'update']);
Route::delete('/danh-muc/{id}', [DanhMucController::class, 'destroy']);

Route::get('/san-pham', [SanPhamController::class, 'index']);
Route::get('/san-pham/{id}', [SanPhamController::class, 'show']);
Route::get('/danh-muc/{id}/san-pham', [SanPhamController::class, 'getByDanhMuc']);

Route::post('/san-pham', [SanPhamController::class, 'store']);
Route::put('/san-pham/{id}', [SanPhamController::class, 'update']);
Route::delete('/san-pham/{id}', [SanPhamController::class, 'destroy']);

Route::post('/san-pham/nhap-kho', [SanPhamController::class, 'nhapKho']);
Route::post('/san-pham/xuat-kho', [SanPhamController::class, 'xuatKho']);
//Lấy toàn bộ đơn hàng cho admin
Route::get('/donhang', [DonHangController::class, 'index']);

//tạo đơn hàng
Route::post('/donhang', [DonHangController::class, 'store']);

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
// Routes cho Giỏ hàng - CHỈ ĐỊNH NGHĨA 1 LẦN
Route::get('/giohang/count', [GioHangController::class, 'count']);      // Phải để TRƯỚC /giohang/{maSanPham}
Route::get('/giohang', [GioHangController::class, 'index']);           
Route::post('/giohang', [GioHangController::class, 'store']);        
Route::delete('/giohang/{maSanPham}', [GioHangController::class, 'destroy']);
Route::delete('/giohang', [GioHangController::class, 'clear']);       

// Routes cho Danh mục sản phẩm
Route::get('/danhmucsanpham', [DanhMucSanPhamController::class, 'index']);        
Route::get('/danhmucsanpham/{id}', [DanhMucSanPhamController::class, 'show']);  
Route::post('/danhmucsanpham', [DanhMucSanPhamController::class, 'store']); 
Route::put('/danhmucsanpham/{id}', [DanhMucSanPhamController::class, 'update']); 
Route::delete('/danhmucsanpham/{id}', [DanhMucSanPhamController::class, 'destroy']);
Route::prefix('users')->group(function () {
    // --- NHÓM 1: CÔNG KHAI (Public Routes) ---
    Route::post('/login', [UserController::class, 'login']);
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
