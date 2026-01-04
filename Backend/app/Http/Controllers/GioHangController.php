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
                $thanhTien = ($item->sanpham->giaBan ?? 0) * $item->soLuong;
                $tongTien += $thanhTien;
                
                return [
                    'maSanPham' => $item->maSanPham,
                    'tenSanPham' => $item->sanpham->tenSanPham ?? '',
                    'giaBan' => $item->sanpham->giaBan ?? 0,
                    'hinhAnh' => $item->sanpham->hinhAnh ?? '',
                    'soLuong' => $item->soLuong,
                    'soLuongTon' => $item->sanpham->soLuongTon ?? 0,
                    'thanhTien' => $thanhTien,
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
            'maSanPham' => 'required|integer|exists:sanpham,maSanPham',
            'soLuong' => 'required|integer|min:1'
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
            $soLuongMuon = $request->soLuong;

            // Kiểm tra sản phẩm
            $sanPham = Sanpham::find($maSanPham);
            if (!$sanPham) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm không tồn tại'
                ], 404);
            }

            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            $existing = Giohang::where('maNguoiDung', $maNguoiDung)
                ->where('maSanPham', $maSanPham)
                ->first();

            // Tính tổng số lượng sẽ có trong giỏ
            $soLuongHienTai = $existing ? $existing->soLuong : 0;
            $tongSoLuong = $soLuongHienTai + $soLuongMuon;

            // Kiểm tra tồn kho
            if ($tongSoLuong > $sanPham->soLuongTon) {
                return response()->json([
                    'success' => false,
                    'message' => "Không đủ hàng! Chỉ còn {$sanPham->soLuongTon} sản phẩm trong kho" . 
                                 ($soLuongHienTai > 0 ? " (bạn đã có {$soLuongHienTai} trong giỏ)" : "")
                ], 400);
            }

            if ($existing) {
                // Đã có trong giỏ → cộng thêm số lượng
                $existing->soLuong = $tongSoLuong;
                $existing->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Đã cập nhật số lượng trong giỏ hàng',
                    'data' => $existing
                ], 200);
            } else {
                // Chưa có → thêm mới
                $gioHang = Giohang::create([
                    'maNguoiDung' => $maNguoiDung,
                    'maSanPham' => $maSanPham,
                    'soLuong' => $soLuongMuon
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Thêm vào giỏ hàng thành công',
                    'data' => $gioHang
                ], 201);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm vào giỏ hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ
     */
    public function update(Request $request, $maSanPham)
    {
        $validator = Validator::make($request->all(), [
            'soLuong' => 'required|integer|min:1'
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
            $soLuongMoi = $request->soLuong;

            $gioHang = Giohang::where('maNguoiDung', $maNguoiDung)
                ->where('maSanPham', $maSanPham)
                ->first();

            if (!$gioHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy sản phẩm trong giỏ hàng'
                ], 404);
            }

            // Kiểm tra tồn kho
            $sanPham = Sanpham::find($maSanPham);
            if ($soLuongMoi > $sanPham->soLuongTon) {
                return response()->json([
                    'success' => false,
                    'message' => "Không đủ hàng! Chỉ còn {$sanPham->soLuongTon} sản phẩm trong kho"
                ], 400);
            }

            $gioHang->soLuong = $soLuongMoi;
            $gioHang->save();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật số lượng thành công',
                'data' => $gioHang
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }

    // Các method khác giữ nguyên...
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

    public function count(Request $request)
    {
        try {
            $maNguoiDung = $request->user()->maNguoiDung;
            $count = Giohang::where('maNguoiDung', $maNguoiDung)->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đếm giỏ hàng: ' . $e->getMessage()
            ], 500);
        }
    }
}