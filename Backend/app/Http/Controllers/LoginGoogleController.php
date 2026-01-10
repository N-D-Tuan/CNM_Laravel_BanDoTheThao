<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use Exception;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;


class LoginGoogleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function redirectToGoogle(){
        //redirect to google 
     return Socialite::driver('google')->redirect();
    }

    public function loginWithGoogle()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->id,
                    ]);
                }
            } else {
                $user = User::create([
                    'tenNguoiDung'      => $googleUser->name,
                    'email'     => $googleUser->email,
                    'google_id' => (string)$googleUser->id,
                    'matKhau'  => bcrypt(Str::random(32)),
                    'role' => 'Customer'
                ]);
            }

            $token = $user->createToken('google-login')->plainTextToken;

            return redirect(
                'http://127.0.0.1:5500/Frontend/index.html?' .
                http_build_query([
                    'login' => 'success',
                    'token' => $token,
                    'user' => json_encode([
                        'maNguoiDung'           => $user->maNguoiDung,
                        'tenNguoiDung' => $user->tenNguoiDung,
                        'email'        => $user->email,
                        'soDienThoai' => $user->soDienThoai,
                        'role'         => $user->role,
                    ])
                ])
            );

        } catch (\Exception $e) {
            dd($e->getMessage());
        }
    }


}
