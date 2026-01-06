<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VNPayController extends Controller
{
    public function createPayment(Request $request)
    {
        // Kiểm tra dữ liệu đầu vào để tránh lỗi 500 do thiếu tham số
        $request->validate([
            'amount' => 'required|numeric|min:1000',
        ]);

        // Lấy từ config thay vì env để tránh lỗi null khi cache
        $vnp_TmnCode = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_Url = config('services.vnpay.url');
        $vnp_ReturnUrl = config('services.vnpay.return_url');

        // Kiểm tra và báo lỗi cụ thể nếu vẫn trống
        if (empty($vnp_TmnCode) || empty($vnp_HashSecret)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi cấu hình: VNP_TMN_CODE hoặc VNP_HASH_SECRET đang trống trong hệ thống.'
            ], 500);
        }

        $vnp_TxnRef = $request->order_id ?? "LPT" . time(); 
        $vnp_OrderInfo = "Thanh toan don hang LPT Store #" . $vnp_TxnRef;
        $vnp_OrderType = "billpayment";
        $vnp_Amount = $request->amount * 100;
        $vnp_Locale = 'vn';
        $vnp_IpAddr = $request->ip();

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_ReturnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if (isset($vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        return response()->json([
            'status' => 'success',
            'payment_url' => $vnp_Url
        ]);
    }

    public function vnpayReturn(Request $request)
    {
        // Kiểm tra mã phản hồi từ VNPay
        if ($request->vnp_ResponseCode == "00") {
            // Redirect về Frontend kèm tham số success để JS xử lý tiếp
            return redirect()->away("http://127.0.0.1:5500/index.html?payment=success");
        } else {
            // Redirect kèm tham số failed
            return redirect()->away("http://127.0.0.1:5500/index.html?payment=failed");
        }
    }
}
