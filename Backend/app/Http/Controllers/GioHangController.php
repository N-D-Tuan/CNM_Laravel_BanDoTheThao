<?php

namespace App\Http\Controllers;

use App\Models\Giohang;
use App\Models\Sanpham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GioHangController extends Controller
{
    /**
     * Lấy danh sách giỏ hàng của user
     */
    public function index(Request $request)
    {
        try {
            $maNguoiDung = $request->user()->maNguoiDung;
            
            $gioHang = Giohang::where('maNguoiDung', $maNguoiDung)
                ->with(['sanpham.danhmucsanpham'])
                ->get();

            $tongTien = 0;
            $items = $gioHang->map(function($item) use (&$tongTien) {
                $thanhTien = $item->sanpham->giaBan ?? 0;
                $tongTien += $thanhTien;
                
                return [
                    'maSanPham' => $item->maSanPham,
                    'tenSanPham' => $item->sanpham->tenSanPham ?? '',
                    'giaBan' => $item->sanpham->giaBan ?? 0,
                    'hinhAnh' => $item->sanpham->hinhAnh ?? '',
                    'soLuongTon' => $item->sanpham->soLuongTon ?? 0,
                    'tenDanhMuc' => $item->sanpham->danhmucsanpham->tenDanhMuc ?? null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $items,
                    'tongTien' => $tongTien,
                    'soLuongSanPham' => $items->count()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy giỏ hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'maSanPham' => 'required|integer|exists:sanpham,maSanPham'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $maNguoiDung = $request->user()->maNguoiDung;
            $maSanPham = $request->maSanPham;

            // Kiểm tra sản phẩm có tồn tại và còn hàng không
            $sanPham = Sanpham::find($maSanPham);
            if (!$sanPham) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm không tồn tại'
                ], 404);
            }

            if ($sanPham->soLuongTon <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm đã hết hàng'
                ], 400);
            }

            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            $existing = Giohang::where('maNguoiDung', $maNguoiDung)
                ->where('maSanPham', $maSanPham)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm đã có trong giỏ hàng'
                ], 400);
            }

            // Thêm vào giỏ hàng
            $gioHang = Giohang::create([
                'maNguoiDung' => $maNguoiDung,
                'maSanPham' => $maSanPham
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thêm vào giỏ hàng thành công',
                'data' => $gioHang
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm vào giỏ hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     */
    public function destroy(Request $request, $maSanPham)
    {
        try {
            $maNguoiDung = $request->user()->maNguoiDung;

            $deleted = Giohang::where('maNguoiDung', $maNguoiDung)
                ->where('maSanPham', $maSanPham)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy sản phẩm trong giỏ hàng'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa sản phẩm khỏi giỏ hàng thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    public function clear(Request $request)
    {
        try {
            $maNguoiDung = $request->user()->maNguoiDung;

            Giohang::where('maNguoiDung', $maNguoiDung)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa toàn bộ giỏ hàng thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa giỏ hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đếm số lượng sản phẩm trong giỏ hàng
     */
    public function count(Request $request)
    {
        try {
            $maNguoiDung = $request->user()->maNguoiDung;
            
            $count = Giohang::where('maNguoiDung', $maNguoiDung)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đếm giỏ hàng: ' . $e->getMessage()
            ], 500);
        }
    }
}