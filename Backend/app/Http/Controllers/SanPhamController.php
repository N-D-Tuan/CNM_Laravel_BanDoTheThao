<?php

namespace App\Http\Controllers;

use App\Models\Sanpham;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SanPhamController extends Controller
{
    public function index()
    {
        return response()->json(
            Sanpham::with('danhmucsanpham')->get()
        );
    }

    public function show($id)
    {
        return response()->json(
            Sanpham::with('danhmucsanpham')->findOrFail($id)
        );
    }

    public function getByDanhMuc($id)
    {
        return response()->json(
            Sanpham::where('maDanhMuc', $id)->get()
        );
    }

    public function filter(Request $request)
    {
        $query = Sanpham::query();

        if ($request->filled('keyword')) {
            $keyword = $this->removeVietnameseAccents($request->keyword);
            $query->whereRaw("LOWER(tenSanPham) LIKE ?", ['%' . $keyword . '%']);
        }

        if ($request->filled('categoryId') && $request->categoryId != 0) {
            $query->where('maDanhMuc', $request->categoryId);
        }

        if ($request->filled('minPrice') && $request->filled('maxPrice')) {
            $query->whereBetween('giaBan', [$request->minPrice, $request->maxPrice]);
        }

        if ($request->filled('sort')) {
            match ($request->sort) {
                'newest'      => $query->orderByDesc('created_at'),
                'best-seller' => $query->withSum('chitietdonhangs as soLuongBan', 'soLuong')->orderByDesc('soLuongBan'),
                'price-asc'   => $query->orderBy('giaBan'),
                'price-desc'  => $query->orderByDesc('giaBan'),
                default       => $query
            };
        }

        return response()->json(
            $query->with('danhmucsanpham')->paginate(5)
        );
    }

    private function removeVietnameseAccents($str)
    {
        $accents = [
            'a' => 'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ',
            'd' => 'đ',
            'e' => 'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ',
            'i' => 'í|ì|ỉ|ĩ|ị',
            'o' => 'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ',
            'u' => 'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự',
            'y' => 'ý|ỳ|ỷ|ỹ|ỵ',
        ];
        foreach ($accents as $nonAccent => $accent) {
            $str = preg_replace("/($accent)/i", $nonAccent, $str);
        }
        return strtolower($str);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tenSanPham' => 'required|string|max:255',
            'giaNhap'    => 'required|numeric|min:0',
            'giaBan'     => 'required|numeric|min:0',
            'soLuongTon' => 'required|integer|min:0',
            'hinhAnh'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'moTa'       => 'nullable|string',
            'maDanhMuc'  => 'required|exists:danhmucsanpham,maDanhMuc',
        ]);

        $data = $request->except('hinhAnh');

        if ($request->hasFile('hinhAnh')) {
            $path = $request->file('hinhAnh')->store('sanpham', 'public');
            $data['hinhAnh'] = $path; 
        }

        $sp = Sanpham::create($data);

        return response()->json($sp, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'tenSanPham' => 'required|string|max:255',
            'giaNhap'    => 'required|numeric|min:0',
            'giaBan'     => 'required|numeric|min:0',
            'soLuongTon' => 'required|integer|min:0',
            'hinhAnh'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'moTa'       => 'nullable|string',
            'maDanhMuc'  => 'required|exists:danhmucsanpham,maDanhMuc',
        ]);

        $sp = Sanpham::findOrFail($id);

        $data = $request->except('hinhAnh');

        if ($request->hasFile('hinhAnh')) {
            $path = $request->file('hinhAnh')->store('sanpham', 'public');
            $data['hinhAnh'] = $path;
        }

        $sp->update($data);

        return response()->json($sp);
    }

    public function destroy($id)
    {
        Sanpham::destroy($id);
        return response()->json(['message' => 'Xóa sản phẩm thành công']);
    }

    public function nhapKho(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.maSanPham' => 'required|exists:sanpham,maSanPham',
            'items.*.soLuong' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                $sp = Sanpham::findOrFail($item['maSanPham']);
                $sp->increment('soLuongTon', $item['soLuong']);
            }
        });

        return response()->json(['message' => 'Nhập kho thành công']);
    }

    public function xuatKho(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.maSanPham' => 'required|exists:sanpham,maSanPham',
            'items.*.soLuong' => 'required|integer|min:1',
        ]);

        try {
            DB::transaction(function () use ($request) {
                foreach ($request->items as $item) {
                    $sp = Sanpham::findOrFail($item['maSanPham']);
                    if ($sp->soLuongTon < $item['soLuong']) {
                        throw new Exception("Sản phẩm {$sp->tenSanPham} không đủ tồn kho");
                    }
                }
                foreach ($request->items as $item) {
                    $sp = Sanpham::findOrFail($item['maSanPham']);
                    $sp->decrement('soLuongTon', $item['soLuong']);
                }
            });

            return response()->json(['message' => 'Xuất kho thành công']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}