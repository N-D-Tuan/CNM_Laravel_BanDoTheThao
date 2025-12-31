<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
 * @property string|null $remember_token
 * @property Collection|Danhgiasanpham[] $danhgiasanphams
 * @property Collection|Donhang[] $donhangs
 * @property Collection|Giohang[] $giohangs
 *
 * @package App\Models
 */
class User extends Authenticatable
{
	use HasApiTokens, Notifiable, SoftDeletes;
	
	protected $table = 'user';
	protected $primaryKey = 'maNguoiDung';
	public $timestamps = false;

	protected $casts = [
		'resetOtpExpiry' => 'datetime',
        'deleted_at' => 'datetime'
	];

	protected $fillable = [
		'tenNguoiDung',
		'email',
		'soDienThoai',
		'matKhau',
		'role',
		'resetOtp',
		'resetOtpExpiry',
        'remember_token'
	];

	protected $hidden = [
        'matKhau',
        'remember_token', 
    ];
	
	public function getAuthPassword()
    {
        return $this->matKhau;
    }

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
