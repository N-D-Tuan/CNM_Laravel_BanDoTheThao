<?php

namespace App\Http\Controllers;

use App\Models\Sanpham;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SanPhamController extends Controller
{
    // Danh sách sản phẩm
    public function index()
    {
        return response()->json(
            Sanpham::with('danhmucsanpham')->get()
        );
    }

    // Chi tiết 1 sản phẩm
    public function show($id)
    {
        return response()->json(
            Sanpham::with('danhmucsanpham')->findOrFail($id)
        );
    }

    // Lấy sản phẩm theo danh mục
    public function getByDanhMuc($id)
    {
        return response()->json(
            Sanpham::where('maDanhMuc', $id)->get()
        );
    }

    // Thêm sản phẩm
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

        $sp = Sanpham::create($request->only([
            'tenSanPham',
            'giaNhap',
            'giaBan',
            'soLuongTon',
            'maDanhMuc',
            'hinhAnh',
            'moTa'
        ]));
    
        // $data = $request->only([
        //     'tenSanPham',
        //     'giaNhap',
        //     'giaBan',
        //     'soLuongTon',
        //     'maDanhMuc',
        //     'moTa'
        // ]);

        // // 👉 Xử lý upload ảnh
        // if ($request->hasFile('hinhAnh')) {
        //     $path = $request->file('hinhAnh')->store('sanpham', 'public');
        //     $data['hinhAnh'] = $path;
        // }

        // $sp = Sanpham::create($data);

        return response()->json($sp, 201);
    }

    // Cập nhật sản phẩm
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

        $sp->update($request->only([
            'tenSanPham',
            'giaNhap',
            'giaBan',
            'soLuongTon',
            'maDanhMuc',
            'hinhAnh',
            'moTa'
        ]));

        // $data = $request->only([
        //     'tenSanPham',
        //     'giaNhap',
        //     'giaBan',
        //     'soLuongTon',
        //     'maDanhMuc',
        //     'moTa'
        // ]);

        // if ($request->hasFile('hinhAnh')) {
        //     $path = $request->file('hinhAnh')->store('sanpham', 'public');
        //     $data['hinhAnh'] = $path;
        // }

        // $sp->update($data);
        return response()->json($sp);
    }

    // Xóa sản phẩm
    public function destroy($id)
    {
        Sanpham::destroy($id);
        return response()->json(['message' => 'Xóa sản phẩm thành công']);
    }
    // Nhập kho
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

        return response()->json([
            'message' => 'Nhập kho thành công'
        ]);
    }

    // Xuất kho
    public function xuatKho(Request $request)
    {
        $request->validate([
        'items' => 'required|array|min:1',
        'items.*.maSanPham' => 'required|exists:sanpham,maSanPham',
        'items.*.soLuong' => 'required|integer|min:1',
    ]);

    try {
        DB::transaction(function () use ($request) {

            // Check tồn kho
            foreach ($request->items as $item) {
                $sp = Sanpham::findOrFail($item['maSanPham']);

                if ($sp->soLuongTon < $item['soLuong']) {
                    throw new Exception(
                        "Sản phẩm {$sp->tenSanPham} không đủ tồn kho"
                    );
                }
            }

            // Trừ kho
            foreach ($request->items as $item) {
                $sp = Sanpham::findOrFail($item['maSanPham']);
                $sp->decrement('soLuongTon', $item['soLuong']);
            }
        });

        return response()->json([
            'message' => 'Xuất kho thành công'
        ]);

    } catch (Exception $e) {
        return response()->json([
            'message' => $e->getMessage()
        ], 400);
    }
    }

}
