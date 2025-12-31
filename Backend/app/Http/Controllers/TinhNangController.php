<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TinhNangSanPham;
use App\Models\SanPham;

class TinhNangController extends Controller
{
    public function themTinhNang(Request $request)
    {
        try {
            // Validate dữ liệu từ request
            $request->validate([
                'maSanPham' => 'required|exists:SanPham,maSanPham',
                'tenTinhNang' => 'required|string|max:100',
            ]);

            // Lấy sản phẩm dựa trên mã sản phẩm
            $sanPham = SanPham::where('maSanPham', $request->maSanPham)->first();

            if (!$sanPham) {
                return response()->json([
                    'message' => 'Sản phẩm không tồn tại!'
                ], 404);
            }

            // Tạo mới tính năng
            $tinhNang = new TinhNangSanPham();
            $tinhNang->maSanPham = $sanPham->maSanPham;
            $tinhNang->tenTinhNang = $request->tenTinhNang;
            $tinhNang->save();

            // Trả về response
            return response()->json([
                'message' => 'Thêm mới tính năng thành công!',
                'data' => $tinhNang
            ], 201);
        } catch (\Exception $e) {
            // Xử lý lỗi và trả về thông báo lỗi
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi thêm tính năng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Lấy danh sách tính năng theo mã sản phẩm
    public function xemTinhNang($maSanPham)
    {
        try {
            // Kiểm tra sản phẩm có tồn tại không
            $sanPham = SanPham::where('maSanPham', $maSanPham)->first();

            if (!$sanPham) {
                return response()->json([
                    'message' => 'Sản phẩm không tồn tại!'
                ], 404);
            }

            // Lấy danh sách tính năng của sản phẩm
            $tinhNangs = TinhNangSanPham::where('maSanPham', $maSanPham)->get();

            // Trả về danh sách tính năng
            return response()->json([
                'message' => 'Danh sách tính năng của sản phẩm',
                'data' => $tinhNangs
            ], 200);
        } catch (\Exception $e) {
            // Xử lý lỗi và trả về thông báo lỗi
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi lấy danh sách tính năng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Sửa tính năng
    public function suaTinhNang(Request $request, $maTinhNang)
    {
        try {
            $request->validate([
                'tenTinhNang' => 'required|string|max:100',
            ]);

            $tinhNang = TinhNangSanPham::find($maTinhNang);

            if (!$tinhNang) {
                return response()->json([
                    'message' => 'Tính năng không tồn tại!'
                ], 404);
            }

            $tinhNang->tenTinhNang = $request->tenTinhNang;
            $tinhNang->save();

            return response()->json([
                'message' => 'Cập nhật tính năng thành công!',
                'data' => $tinhNang
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi cập nhật tính năng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Xóa tính năng
    public function xoaTinhNang($maTinhNang)
    {
        try {
            $tinhNang = TinhNangSanPham::find($maTinhNang);

            if (!$tinhNang) {
                return response()->json([
                    'message' => 'Tính năng không tồn tại!'
                ], 404);
            }

            $tinhNang->delete();

            return response()->json([
                'message' => 'Xóa tính năng thành công!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi xóa tính năng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function xemTatCaTinhNang()
    {
        try {
            // Lấy tất cả tính năng
            $tinhNangs = TinhNangSanPham::all();

            // Trả về danh sách tính năng
            return response()->json([
                'message' => 'Danh sách tất cả tính năng',
                'data' => $tinhNangs
            ], 200);
        } catch (\Exception $e) {
            // Xử lý lỗi và trả về thông báo lỗi
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi lấy danh sách tính năng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}