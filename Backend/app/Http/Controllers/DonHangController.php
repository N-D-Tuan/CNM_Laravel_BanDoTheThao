<?php

namespace App\Http\Controllers;

use App\Models\Chitietdonhang;
use App\Models\Donhang;
use App\Models\Sanpham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Danhgiasanpham;

class DonHangController extends Controller
{
    //get toàn bộ đơn hàng
    public function index()
    {
        $donhangs = Donhang::with([
            'user',
            'chitietdonhangs.sanpham'
        ])->get();

        $result = $donhangs->map(function ($dh) {
            return [
                'id' => $dh->maDonHang,
                'userId' => $dh->maNguoiDung,
                'customer' => $dh->user->tenNguoiDung ?? '',
                'date' => $dh->ngayDat,
                'total' => $dh->tongTien,
                'status' => $dh->trangThai,
                'details' => $dh->chitietdonhangs->map(function ($ct) {
                    return [
                        'name' => $ct->sanpham->tenSanPham ?? '',
                        'quantity' => $ct->soLuong,
                        'price' => $ct->sanpham->giaBan ?? 0,
                        'img' => $ct->sanpham->hinhAnh ?? null,
                    ];
                })
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Lấy danh sách đơn hàng thành công',
            'data' => $result
        ]);
    }

    public function store(Request $request)
    {
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
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Lỗi tạo đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //lấy đơn hàng theo user
    public function getByUser($id)
    {
        $donhangs = Donhang::where('maNguoiDung', $id)
            ->with('chitietdonhangs.sanpham')
            ->orderBy('ngayDat', 'desc') // Sắp xếp đơn mới nhất lên đầu
            ->get();

        // 1. Lấy danh sách ID các sản phẩm user này ĐÃ đánh giá
        $ratedProductIds = Danhgiasanpham::where('maNguoiDung', $id)
                                ->pluck('maSanPham')
                                ->toArray();

        // 2. Map dữ liệu để thêm cờ is_rated
        $result = $donhangs->map(function ($dh) use ($ratedProductIds) {
            
            // Logic kiểm tra: Đã đánh giá hết các món trong đơn chưa?
            $isRated = true;
            if ($dh->chitietdonhangs->isEmpty()) {
                $isRated = false;
            } else {
                foreach ($dh->chitietdonhangs as $ct) {
                    // Nếu có món nào chưa nằm trong danh sách đã đánh giá => Coi như đơn này chưa xong
                    if (!in_array($ct->maSanPham, $ratedProductIds)) {
                        $isRated = false;
                        break;
                    }
                }
            }

            return [
                'id' => $dh->maDonHang,
                'date' => $dh->ngayDat?->format('d/m/Y H:i'),
                'status' => $dh->trangThai,
                'total' => $dh->tongTien,
                'address' => $dh->diaChi,
                
                // 👇 QUAN TRỌNG: Thêm dòng này để Frontend biết mà hiện nút
                'is_rated' => $isRated, 
                // --------------------------------------------------------

                'items' => $dh->chitietdonhangs->map(function ($ct) {
                    return [
                        'maSanPham' => $ct->sanpham->maSanPham ?? null,
                        'name' => $ct->sanpham->tenSanPham ?? '',
                        'qty' => $ct->soLuong,
                        'price' => $ct->sanpham->giaBan ?? 0,
                        'img' => $ct->sanpham->hinhAnh ?? null,
                    ];
                })
            ];
        });

        return response()->json([
            'status' => true,
            'data' => $result
        ]);
    }



    //Lấy đơn hàng theo mã đơn hàng(dùng để khi người dùng click vào bấm xem chi tiết đơn hàng đó)
    public function getByMaDonHang($id)
    {
        $donHang = Donhang::with([
            'user',
            'chitietdonhangs.sanpham'
        ])->find($id);

        if (!$donHang) {
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
    function updateTrangThai(Request $request, $id)
    {
        $request->validate([
            'trangThai' => 'required|in:Chờ duyệt,Đang giao,Đã giao,Đã hủy'
        ]);

        $donHang = Donhang::find($id);

        if (!$donHang) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
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
