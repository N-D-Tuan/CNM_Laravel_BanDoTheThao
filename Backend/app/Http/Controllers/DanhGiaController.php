<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Danhgiasanpham; 
use Carbon\Carbon;


class DanhGiaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'maSanPham' => 'required|exists:SanPham,maSanPham', 
            'soSao'     => 'required|integer|min:1|max:5',      
            'binhLuan'  => 'nullable|string',
        ]);

        try {
            $danhGia = Danhgiasanpham::create([
                'maNguoiDung' => 1, 
                'maSanPham'   => $request->maSanPham,
                'soSao'       => $request->soSao,
                'binhLuan'    => $request->binhLuan,
                'ngayDanhGia' => Carbon::now() 
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Đánh giá sản phẩm thành công!',
                'data'    => $danhGia
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi khi đánh giá: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index($maSanPham)
    {
        $danhSach = Danhgiasanpham::where('maSanPham', $maSanPham)
                    ->with('user:maNguoiDung,tenNguoiDung') 
                    ->orderBy('ngayDanhGia', 'desc')
                    ->get();

        return response()->json($danhSach);
    }
}