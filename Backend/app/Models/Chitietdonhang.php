<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Chitietdonhang
 * 
 * @property int $maDonHang
 * @property int $maSanPham
 * @property int $soLuong
 * 
 * @property Donhang $donhang
 * @property Sanpham $sanpham
 *
 * @package App\Models
 */
class Chitietdonhang extends Model
{
	protected $table = 'chitietdonhang';
	public $incrementing = false;
	public $timestamps = false;
	protected $primaryKey = null;

	protected $casts = [
		'maDonHang' => 'int',
		'maSanPham' => 'int',
		'soLuong' => 'int'
	];

	protected $fillable = [
		'maDonHang',
        'maSanPham',
		'soLuong'
	];

	public function donhang()
	{
		return $this->belongsTo(Donhang::class, 'maDonHang');
	}

	public function sanpham()
	{
		return $this->belongsTo(Sanpham::class, 'maSanPham');
	}
}
