<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Giohang extends Model
{
    protected $table = 'giohang';
    
    // ✅ QUAN TRỌNG: Bảng giohang không có id, mà dùng composite key
    public $incrementing = false;
    protected $primaryKey = ['maNguoiDung', 'maSanPham'];  // ← Composite key
    
    public $timestamps = false;

    protected $fillable = [
        'maNguoiDung',
        'maSanPham',
        'soLuong'
    ];

    protected $casts = [
        'maNguoiDung' => 'int',
        'maSanPham' => 'int',
        'soLuong' => 'int'
    ];

    // ✅ THÊM: Override getKeyName để Laravel biết dùng composite key
    public function getKeyName()
    {
        return $this->primaryKey;
    }

    // ✅ THÊM: Override setKeysForSaveQuery để update đúng
    protected function setKeysForSaveQuery($query)
    {
        if (is_array($this->primaryKey)) {
            foreach ($this->primaryKey as $key) {
                $query->where($key, '=', $this->getAttribute($key));
            }
            return $query;
        }
        
        return parent::setKeysForSaveQuery($query);
    }

    // Relations
    public function sanpham()
    {
        return $this->belongsTo(Sanpham::class, 'maSanPham', 'maSanPham');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'maNguoiDung', 'maNguoiDung');
    }
}