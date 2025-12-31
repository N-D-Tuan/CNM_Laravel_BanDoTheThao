<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SanPhamController;
use App\Http\Controllers\DanhMucController;
use App\Http\Controllers\TinhNangController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/tinh-nang', [TinhNangController::class, 'themTinhNang']);
Route::get('/tinh-nang/{maSanPham}', [TinhNangController::class, 'xemTinhNang']);
Route::put('/tinh-nang/{maTinhNang}', [TinhNangController::class, 'suaTinhNang']);
Route::delete('/tinh-nang/{maTinhNang}', [TinhNangController::class, 'xoaTinhNang']);
Route::get('/tinh-nang', [TinhNangController::class, 'xemTatCaTinhNang']);