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