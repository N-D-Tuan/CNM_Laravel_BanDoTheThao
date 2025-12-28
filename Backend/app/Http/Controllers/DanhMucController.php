<?php

namespace App\Http\Controllers;

use App\Models\Danhmucsanpham;
use Illuminate\Http\Request;

class DanhMucController extends Controller
{
    // Lấy danh sách danh mục
    public function index()
    {
        return response()->json(Danhmucsanpham::all());
    }

    // Thêm danh mục
    public function store(Request $request)
    {
        $request->validate([
            'tenDanhMuc' => 'required|string|max:255'
        ]);

        $dm = Danhmucsanpham::create([
            'tenDanhMuc' => $request->tenDanhMuc
        ]);

        return response()->json($dm, 201);
    }

    // Cập nhật danh mục
    public function update(Request $request, $id)
    {
        $request->validate([
            'tenDanhMuc' => 'required|string|max:255'
        ]);

        $dm = Danhmucsanpham::findOrFail($id);
        $dm->update([
            'tenDanhMuc' => $request->tenDanhMuc
        ]);

        return response()->json($dm);
    }

    // Xóa danh mục
    public function destroy($id)
    {
        $dm = Danhmucsanpham::findOrFail($id);

        if ($dm->sanphams()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa danh mục còn sản phẩm'
            ], 400);
        }

        $dm->delete();

        return response()->json([
            'message' => 'Xóa danh mục thành công'
        ]);
    }
}
