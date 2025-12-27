<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Tinhnangsanpham
 * 
 * @property int $maTinhNang
 * @property int|null $maSanPham
 * @property string|null $tenTinhNang
 * 
 * @property Sanpham|null $sanpham
 *
 * @package App\Models
 */
class Tinhnangsanpham extends Model
{
	protected $table = 'tinhnangsanpham';
	protected $primaryKey = 'maTinhNang';
	public $timestamps = false;

	protected $casts = [
		'maSanPham' => 'int'
	];

	protected $fillable = [
		'maSanPham',
		'tenTinhNang'
	];

	public function sanpham()
	{
		return $this->belongsTo(Sanpham::class, 'maSanPham');
	}
}
