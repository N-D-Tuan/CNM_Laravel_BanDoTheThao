<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Giohang
 * 
 * @property int $maNguoiDung
 * @property int $maSanPham
 * 
 * @property Sanpham $sanpham
 * @property User $user
 *
 * @package App\Models
 */
class Giohang extends Model
{
	protected $table = 'giohang';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'maNguoiDung' => 'int',
		'maSanPham' => 'int'
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
