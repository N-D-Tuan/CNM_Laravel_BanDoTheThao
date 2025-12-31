<?php

namespace App\Http\Controllers;

use App\Models\Danhmucsanpham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DanhMucSanPhamController extends Controller
{
    /**
     * Lấy danh sách tất cả danh mục
     */
    public function index()
    {
        try {
            $danhMucs = Danhmucsanpham::withCount('sanphams')->get();

            return response()->json([
                'success' => true,
                'data' => $danhMucs
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một danh mục
     */
    public function show($id)
    {
        try {
            $danhMuc = Danhmucsanpham::with('sanphams')->find($id);

            if (!$danhMuc) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy danh mục'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $danhMuc
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo danh mục mới (Admin only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tenDanhMuc' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $danhMuc = Danhmucsanpham::create([
                'tenDanhMuc' => $request->tenDanhMuc
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tạo danh mục thành công',
                'data' => $danhMuc
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật danh mục (Admin only)
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'tenDanhMuc' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $danhMuc = Danhmucsanpham::find($id);

            if (!$danhMuc) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy danh mục'
                ], 404);
            }

            $danhMuc->update([
                'tenDanhMuc' => $request->tenDanhMuc
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật danh mục thành công',
                'data' => $danhMuc
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa danh mục (Admin only)
     */
    public function destroy($id)
    {
        try {
            $danhMuc = Danhmucsanpham::find($id);

            if (!$danhMuc) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy danh mục'
                ], 404);
            }

            // Kiểm tra xem danh mục có sản phẩm không
            if ($danhMuc->sanphams()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa danh mục đang có sản phẩm'
                ], 400);
            }

            $danhMuc->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa danh mục thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa danh mục: ' . $e->getMessage()
            ], 500);
        }
    }
}