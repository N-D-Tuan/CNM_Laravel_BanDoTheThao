<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function register(Request $request)
    {
        $rules = [
            'tenNguoiDung' => 'required|string|max:100',
            'email' => 'required|email|unique:user,email',
            'soDienThoai' => 'required|unique:user,soDienThoai',
            'matKhau' => 'required|min:6',
        ];

        $messages = [
            'tenNguoiDung.required' => 'Họ và tên không được để trống.',
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Định dạng email không hợp lệ.',
            'email.unique' => 'Email này đã được sử dụng trên hệ thống.',
            'soDienThoai.required' => 'Số điện thoại không được để trống.',
            'soDienThoai.unique' => 'Số điện thoại này đã tồn tại.',
            'matKhau.required' => 'Vui lòng nhập mật khẩu.',
            'matKhau.min' => 'Mật khẩu phải chứa ít nhất :min ký tự.',
        ];
       
        $request->validate($rules, $messages);

        $user = User::create([
            'tenNguoiDung' => $request->tenNguoiDung,
            'email' => $request->email,
            'soDienThoai' => $request->soDienThoai,
            'matKhau' => Hash::make($request->matKhau), 
            'role' => 'Customer',
        ]);

        return response()->json([
            'message' => 'Đăng ký tài khoản thành công',
            'data' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'matKhau' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->matKhau, $user->matKhau)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác'
            ], 401);
        }

        $token = $user->createToken('authToken')->plainTextToken;

        $user->remember_token = $token;
        $user->save();

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $user,
            'access_token' => $token
        ], 200);
    }

    public function logout(Request $request)
    {
        // Lấy user từ token trong Header
        $user = Auth::guard('sanctum')->user(); 

        if (!$user) {
            return response()->json(['message' => 'Token không hợp lệ hoặc đã hết hạn'], 401);
        }

        $user->currentAccessToken()->delete();

        $user->remember_token = null;
        $user->save();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    public function showAll()
    {
        return response()->json(User::all());
    }

    public function showId($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }
        
        return response()->json($user);
    }

    public function showByName(Request $request)
    {
        $name = $request->query('ten');
        
        if (!$name) {
            return response()->json(['message' => 'Vui lòng nhập tên cần tìm'], 400);
        }

        $users = User::where('tenNguoiDung', 'LIKE', "%$name%")->get();
        return response()->json($users);
    }

    public function softDelete($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        $user->delete();
        
        return response()->json([
            'message' => 'Đã xóa người dùng thành công'
        ]);
    }

    public function updateProfile(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        $request->validate([
            'tenNguoiDung' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:user,email,' . $id . ',maNguoiDung',
            'soDienThoai' => 'sometimes|unique:user,soDienThoai,' . $id . ',maNguoiDung',
        ]);

        $data = $request->only(['tenNguoiDung', 'email', 'soDienThoai']);

        $user->update($data);

        return response()->json([
            'message' => 'Cập nhật hồ sơ cá nhân thành công',
            'data' => $user
        ]);
    }

    public function adminUpdateUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        $request->validate([
            'tenNguoiDung' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:user,email,' . $id . ',maNguoiDung',
            'soDienThoai' => 'sometimes|unique:user,soDienThoai,' . $id . ',maNguoiDung',
            'role' => 'sometimes|in:Admin,Customer',
        ]);

        $data = $request->only(['tenNguoiDung', 'email', 'soDienThoai', 'role']);

        $user->update($data);

        return response()->json([
            'message' => 'Admin cập nhật người dùng thành công',
            'data' => $user
        ]);
    }

    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại'], 404);
        }

        $otp = rand(100000, 999999);

        $user->resetOtp = $otp;
        $user->resetOtpExpiry = now()->addMinutes(30);
        $user->save();
       
        try {
            Mail::raw("Mã OTP xác nhận của bạn là: $otp. Mã này có hiệu lực trong 30 phút.", function ($message) use ($user) {
                $message->to($user->email)->subject('Mã xác nhận đổi mật khẩu - LPT Store');
            });
        } catch (\Exception $e) {
            $user->resetOtp = null;
            $user->save();
            return response()->json(['message' => 'Email của bạn không có thật hoặc không thể nhận tin nhắn lúc này.'], 500);
        }

        return response()->json([
            'message' => 'Mã OTP đã được gửi về email của bạn'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $rules = [
            'email' => 'required|email',
            'otp' => 'required',
            'matKhauMoi' => 'required|min:6'
        ];

        $messages = [
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Định dạng email không hợp lệ.',
            'otp.required' => 'Vui lòng nhập mã OTP.',
            'matKhauMoi.required' => 'Vui lòng nhập mật khẩu mới.',
            'matKhauMoi.min' => 'Mật khẩu mới phải có ít nhất :min ký tự.', 
        ];

    $request->validate($rules, $messages);

        $user = User::where('email', $request->email)
                    ->where('resetOtp', $request->otp)
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'Mã OTP không chính xác'], 400);
        }

        if (now()->gt($user->resetOtpExpiry)) {
            return response()->json(['message' => 'Mã OTP đã hết hạn'], 400);
        }

        $user->matKhau = Hash::make($request->matKhauMoi);
        $user->resetOtp = null;
        $user->resetOtpExpiry = null;
        $user->save();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công!'
        ]);
    }

    public function sendOtpForChangePassword(Request $request)
    {
        $request->validate([
            'matKhauCu' => 'required',
        ]);

        $user = $request->user();

        if (!Hash::check($request->matKhauCu, $user->matKhau)) {
            return response()->json(['message' => 'Mật khẩu cũ không chính xác'], 400);
        }

        $otp = rand(100000, 999999);
        $user->resetOtp = $otp;
        $user->resetOtpExpiry = now()->addMinutes(15);
        $user->save();

        try {
            Mail::raw("Mã OTP xác nhận của bạn là: $otp. Mã này có hiệu lực trong 15 phút.", function ($message) use ($user) {
                $message->to($user->email)->subject('Mã xác nhận đổi mật khẩu - LPT Store');
            });
        } catch (\Exception $e) {
            $user->resetOtp = null;
            $user->save();
            return response()->json(['message' => 'Email của bạn không có thật hoặc không thể nhận tin nhắn lúc này.'], 500);
        }

        return response()->json(['message' => 'Mã OTP đã được gửi về email']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'matKhauCu' => 'required',
            'otp' => 'required',
            'matKhauMoi' => 'required|min:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->matKhauCu, $user->matKhau)) {
            return response()->json(['message' => 'Mật khẩu cũ không chính xác'], 400);
        }

        if ($user->resetOtp !== $request->otp || now()->gt($user->resetOtpExpiry)) {
            return response()->json(['message' => 'Mã OTP không đúng hoặc đã hết hạn'], 400);
        }

        $user->matKhau = Hash::make($request->matKhauMoi);
        $user->resetOtp = null;
        $user->resetOtpExpiry = null;
        $user->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }

    public function getUserStats()
    {
        $stats = [
            'total_users' => User::count(),
            'admins' => User::where('role', 'Admin')->count(),
            'customers' => User::where('role', 'Customer')->count(),
            'deleted_users' => User::onlyTrashed()->count()
        ];
        return response()->json($stats);
    }

    public function showDeleted()
    {
        $deletedUsers = User::onlyTrashed()->get();
        return response()->json($deletedUsers);
    }

    public function restoreUser($id)
    {
        $user = User::withTrashed()->find($id);

        if (!$user || !$user->trashed()) {
            return response()->json(['message' => 'Người dùng không tồn tại trong danh sách xóa'], 404);
        }

        $user->restore();
        return response()->json(['message' => 'Khôi phục thành công', 'user' => $user]);
    }
}
