<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class User
 * 
 * @property int $maNguoiDung
 * @property string $tenNguoiDung
 * @property string $email
 * @property string $soDienThoai
 * @property string $matKhau
 * @property string $role
 * @property string|null $resetOtp
 * @property Carbon|null $resetOtpExpiry
 * @property string|null $deleted_at
 * 
 * @property Collection|Danhgiasanpham[] $danhgiasanphams
 * @property Collection|Donhang[] $donhangs
 * @property Collection|Giohang[] $giohangs
 *
 * @package App\Models
 */
class User extends Model
{
	use SoftDeletes;
	protected $table = 'user';
	protected $primaryKey = 'maNguoiDung';
	public $timestamps = false;

	protected $casts = [
		'resetOtpExpiry' => 'datetime'
	];

	protected $fillable = [
		'tenNguoiDung',
		'email',
		'soDienThoai',
		'matKhau',
		'role',
		'resetOtp',
		'resetOtpExpiry'
	];

	public function danhgiasanphams()
	{
		return $this->hasMany(Danhgiasanpham::class, 'maNguoiDung');
	}

	public function donhangs()
	{
		return $this->hasMany(Donhang::class, 'maNguoiDung');
	}

	public function giohangs()
	{
		return $this->hasMany(Giohang::class, 'maNguoiDung');
	}
}
