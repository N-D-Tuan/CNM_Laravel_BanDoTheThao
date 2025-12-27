<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Danhgiasanpham
 * 
 * @property int $maDanhGia
 * @property int|null $maNguoiDung
 * @property int|null $maSanPham
 * @property int $soSao
 * @property string|null $binhLuan
 * @property Carbon|null $ngayDanhGia
 * 
 * @property Sanpham|null $sanpham
 * @property User|null $user
 *
 * @package App\Models
 */
class Danhgiasanpham extends Model
{
	protected $table = 'danhgiasanpham';
	protected $primaryKey = 'maDanhGia';
	public $timestamps = false;

	protected $casts = [
		'maNguoiDung' => 'int',
		'maSanPham' => 'int',
		'soSao' => 'int',
		'ngayDanhGia' => 'datetime'
	];

	protected $fillable = [
		'maNguoiDung',
		'maSanPham',
		'soSao',
		'binhLuan',
		'ngayDanhGia'
	];

	public function sanpham()
	{
		return $this->belongsTo(Sanpham::class, 'maSanPham');
	}

	public function user()
	{
		return $this->belongsTo(User::class, 'maNguoiDung');
	}
}
