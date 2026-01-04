<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Khi đơn hàng chuyển từ "Chờ duyệt" → "Đang giao" ⇒ trừ kho
        DB::unprepared("
            CREATE TRIGGER trg_donhang_giao
            AFTER UPDATE ON DonHang
            FOR EACH ROW
            BEGIN
                IF OLD.trangThai = 'Chờ duyệt' AND NEW.trangThai = 'Đang giao' THEN
                    UPDATE SanPham sp
                    JOIN ChiTietDonHang ct ON sp.maSanPham = ct.maSanPham
                    SET sp.soLuongTon = sp.soLuongTon - ct.soLuong
                    WHERE ct.maDonHang = NEW.maDonHang;
                END IF;
            END
        ");

        // Khi đơn hàng chuyển từ "Đang giao" → "Đã hủy" ⇒ hoàn kho
        DB::unprepared("
            CREATE TRIGGER trg_donhang_huy
            AFTER UPDATE ON DonHang
            FOR EACH ROW
            BEGIN
                IF OLD.trangThai = 'Đang giao' AND NEW.trangThai = 'Đã hủy' THEN
                    UPDATE SanPham sp
                    JOIN ChiTietDonHang ct ON sp.maSanPham = ct.maSanPham
                    SET sp.soLuongTon = sp.soLuongTon + ct.soLuong
                    WHERE ct.maDonHang = NEW.maDonHang;
                END IF;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP TRIGGER IF EXISTS trg_donhang_giao");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_donhang_huy");
    }
};
