<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SanPhamController;
use App\Http\Controllers\DanhMucController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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