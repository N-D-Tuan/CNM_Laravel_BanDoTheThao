<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Sanpham
 * 
 * @property int $maSanPham
 * @property string $tenSanPham
 * @property int|null $soLuongTon
 * @property float|null $giaNhap
 * @property float|null $giaBan
 * @property string|null $hinhAnh
 * @property string|null $moTa
 * @property int|null $maDanhMuc
 * 
 * @property Danhmucsanpham|null $danhmucsanpham
 * @property Collection|Chitietdonhang[] $chitietdonhangs
 * @property Collection|Danhgiasanpham[] $danhgiasanphams
 * @property Collection|Giohang[] $giohangs
 * @property Collection|Tinhnangsanpham[] $tinhnangsanphams
 *
 * @package App\Models
 */
class Sanpham extends Model
{
	protected $table = 'sanpham';
	protected $primaryKey = 'maSanPham';
	public $timestamps = false;

	protected $casts = [
		'soLuongTon' => 'int',
		'giaNhap' => 'float',
		'giaBan' => 'float',
		'maDanhMuc' => 'int'
	];

	protected $fillable = [
		'tenSanPham',
		'soLuongTon',
		'giaNhap',
		'giaBan',
		'hinhAnh',
		'moTa',
		'maDanhMuc'
	];

	public function danhmucsanpham()
	{
		return $this->belongsTo(Danhmucsanpham::class, 'maDanhMuc');
	}

	public function chitietdonhangs()
	{
		return $this->hasMany(Chitietdonhang::class, 'maSanPham');
	}

	public function danhgiasanphams()
	{
		return $this->hasMany(Danhgiasanpham::class, 'maSanPham');
	}

	public function giohangs()
	{
		return $this->hasMany(Giohang::class, 'maSanPham');
	}

	public function tinhnangsanphams()
	{
		return $this->hasMany(Tinhnangsanpham::class, 'maSanPham');
	}
}
