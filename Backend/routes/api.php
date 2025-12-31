<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DanhGiaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/danh-gia', [DanhGiaController::class, 'store']);
Route::get('/danh-gia/{maSanPham}', [DanhGiaController::class, 'index']);