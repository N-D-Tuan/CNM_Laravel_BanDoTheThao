<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Danhgiasanpham; // <--- ĐÃ SỬA: Dùng đúng tên model của bạn
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class DanhGiaController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'maSanPham'   => 'required|exists:SanPham,maSanPham', 
            'maNguoiDung' => 'required|exists:User,maNguoiDung',
            'soSao'       => 'required|integer|min:1|max:5',      
            'binhLuan'    => 'nullable|string',
        ], [
            'maSanPham.exists'   => 'Sản phẩm không tồn tại.',
            'maNguoiDung.exists' => 'Người dùng không hợp lệ.',
            'soSao.min'          => 'Vui lòng chọn số sao.',
        ]);

        // 2. Trả về lỗi 422 nếu dữ liệu sai
        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            // 3. Tạo đánh giá mới (Dùng đúng model Danhgiasanpham)
            $danhGia = Danhgiasanpham::create([
                'maNguoiDung' => $request->maNguoiDung,
                'maSanPham'   => $request->maSanPham,
                'soSao'       => $request->soSao,
                'binhLuan'    => $request->binhLuan,
                'ngayDanhGia' => Carbon::now() 
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Cảm ơn bạn đã đánh giá!',
                'data'    => $danhGia
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi Server: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index($maSanPham)
    {
        // Lấy danh sách đánh giá theo sản phẩm
        $danhSach = Danhgiasanpham::where('maSanPham', $maSanPham)
                    ->with('user:maNguoiDung,tenNguoiDung') 
                    ->orderBy('ngayDanhGia', 'desc')
                    ->get();

        return response()->json($danhSach);
    }
}