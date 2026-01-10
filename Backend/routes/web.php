<?php

use App\Http\Controllers\LoginGoogleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/auth/google', [LoginGoogleController::class,'redirectToGoogle'])->name('auth.google');
  
Route::get('/auth/google/callback',[LoginGoogleController::class,'loginWithGoogle']);

