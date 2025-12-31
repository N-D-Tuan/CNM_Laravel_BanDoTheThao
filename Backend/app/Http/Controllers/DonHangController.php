<?php

namespace App\Http\Controllers;

use App\Models\Chitietdonhang;
use App\Models\Donhang;
use App\Models\Sanpham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonHangController extends Controller
{
    //get toàn bộ đơn hàng
    public function index() {
        $donhangs = Donhang::with([
            'user',
            'chitietdonhangs'
        ])->get();

        return response()->json([
            'status' => true,
            'message' => 'Lấy danh sách đơn hàng thành công',
            'data' => $donhangs
        ]);
    }

    public function store(Request $request) {
        DB::beginTransaction();
        try {
            //tạo đơn hàng
            $donHang = Donhang::create([
                'maNguoiDung' => $request->maNguoiDung,
                'trangThai' => 'Chờ duyệt',
                'diaChi' => $request->diaChi,
                'ghiChu' => $request->ghiChu ?? null,
                'tongTien' => 0
            ]);

            $tongTien = 0;

            //tạo chi tiết đơn hàng (Gồm các sản phẩm cho đơn hàng vừa tạo ở trên)
            foreach ($request->sanPhams as $item) {
                $sanPham = Sanpham::findOrFail($item['maSanPham']);

                $thanhTien = $sanPham->giaBan * $item['soLuong'];
                $tongTien = $tongTien + $thanhTien;

                Chitietdonhang::create([
                    'maDonHang' => $donHang->maDonHang,
                    'maSanPham' => $item['maSanPham'],
                    'soLuong' => $item['soLuong']
                ]);
            }

            //cập nhật tổng tiền cho đơn hàng tạo lúc đầu
            $donHang->update([
                'tongTien' => $tongTien
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Tạo đơn hàng thành công',
                'data' => $donHang
            ]);
        } catch(\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Lỗi tạo đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //lấy đơn hàng theo user
    public function getByUser($id) {
        $donHang = Donhang::where('maNguoiDung', $id)
            ->with('chitietdonhangs')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $donHang
        ]);
    }

    //Lấy đơn hàng theo mã đơn hàng(dùng để khi người dùng click vào bấm xem chi tiết đơn hàng đó)
    public function getByMaDonHang($id) {
        $donHang = Donhang::with([
            'user',
            'chitietdonhangs.sanpham'
        ])->find($id);

        if(!$donHang) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $donHang
        ]);
    }

    // Cập nhật trạng thái đơn hàng
    function updateTrangThai(Request $request, $id) {
        $request->validate([
            'trangThai' => 'required|in:Chờ duyệt,Đang giao,Đã giao,Đã hủy'
        ]);
        
        $donHang = Donhang::find($id);

        if(!$donHang) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ],404);
        }

        $donHang->trangThai = $request->trangThai;
        $donHang->save();

        return response()->json([
            'status' => true,
            'message' => "Cập nhật trạng thái thành công",
            'data' => $donHang
        ]);
    }
}
