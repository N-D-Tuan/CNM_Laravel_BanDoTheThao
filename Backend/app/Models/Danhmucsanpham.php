<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Danhmucsanpham
 * 
 * @property int $maDanhMuc
 * @property string $tenDanhMuc
 * 
 * @property Collection|Sanpham[] $sanphams
 *
 * @package App\Models
 */
class Danhmucsanpham extends Model
{
	protected $table = 'danhmucsanpham';
	protected $primaryKey = 'maDanhMuc';
	public $timestamps = false;

	protected $fillable = [
		'tenDanhMuc'
	];

	public function sanphams()
	{
		return $this->hasMany(Sanpham::class, 'maDanhMuc');
	}
}
