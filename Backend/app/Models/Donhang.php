<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Donhang
 * 
 * @property int $maDonHang
 * @property int|null $maNguoiDung
 * @property Carbon|null $ngayDat
 * @property string|null $trangThai
 * @property float|null $tongTien
 * @property string $diaChi
 * @property string|null $ghiChu
 * 
 * @property User|null $user
 * @property Collection|Chitietdonhang[] $chitietdonhangs
 *
 * @package App\Models
 */
class Donhang extends Model
{
	protected $table = 'donhang';
	protected $primaryKey = 'maDonHang';
	public $timestamps = false;

	protected $casts = [
		'maNguoiDung' => 'int',
		'ngayDat' => 'datetime',
		'tongTien' => 'float'
	];

	protected $fillable = [
		'maNguoiDung',
		'ngayDat',
		'trangThai',
		'tongTien',
		'diaChi',
		'ghiChu'
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'maNguoiDung');
	}

	public function chitietdonhangs()
	{
		return $this->hasMany(Chitietdonhang::class, 'maDonHang');
	}
}
