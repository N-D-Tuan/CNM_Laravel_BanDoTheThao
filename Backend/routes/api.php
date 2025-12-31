<?php

use App\Http\Controllers\DonHangController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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
