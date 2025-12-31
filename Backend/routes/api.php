<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GioHangController;
use App\Http\Controllers\DanhMucSanPhamController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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
