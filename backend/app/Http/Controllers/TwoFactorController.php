<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\TwoFactorCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Enable 2FA for the authenticated user.
     */
    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'code' => 'already_enabled',
                'message' => 'Two-factor authentication is already enabled.',
            ], 400);
        }

        // Generate secret key
        $secretKey = $this->google2fa->generateSecretKey();

        // Generate QR code URL (otpauth URI)
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secretKey
        );

        // Store secret temporarily (not confirmed yet)
        $user->update(['two_factor_secret' => $secretKey]);

        // Generate recovery codes
        $recoveryCodes = $user->generateRecoveryCodes();

        // Log the action
        AuditLog::log(
            '2fa_enable_initiated',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'secret_key' => $secretKey,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $recoveryCodes,
            'message' => 'Scan the QR code with your authenticator app and verify with a code.',
        ]);
    }

    /**
     * Verify and confirm 2FA setup.
     */
    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid verification code.',
                'details' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $code = $request->input('code');

        if (!$user->two_factor_secret) {
            return response()->json([
                'code' => 'not_initialized',
                'message' => 'Two-factor authentication has not been initialized.',
            ], 400);
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($user->two_factor_secret, $code);

        if (!$valid) {
            return response()->json([
                'code' => 'invalid_code',
                'message' => 'Invalid verification code.',
            ], 400);
        }

        // Enable 2FA
        $user->update([
            'two_factor_enabled' => true,
            'two_factor_confirmed_at' => now(),
        ]);

        // Log the action
        AuditLog::log(
            '2fa_enabled',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Two-factor authentication has been enabled successfully.',
        ]);
    }

    /**
     * Disable 2FA for the authenticated user.
     */
    public function disable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid verification code.',
                'details' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $code = $request->input('code');

        if (!$user->hasTwoFactorEnabled()) {
            return response()->json([
                'code' => 'not_enabled',
                'message' => 'Two-factor authentication is not enabled.',
            ], 400);
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($user->two_factor_secret, $code);

        if (!$valid) {
            return response()->json([
                'code' => 'invalid_code',
                'message' => 'Invalid verification code.',
            ], 400);
        }

        // Disable 2FA
        $user->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        // Log the action
        AuditLog::log(
            '2fa_disabled',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Two-factor authentication has been disabled successfully.',
        ]);
    }

    /**
     * Get 2FA status for the authenticated user.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'enabled' => (bool) $user->two_factor_enabled,
            'confirmed_at' => $user->two_factor_confirmed_at ? $user->two_factor_confirmed_at->toISOString() : null,
        ]);
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasTwoFactorEnabled()) {
            return response()->json([
                'code' => 'not_enabled',
                'message' => 'Two-factor authentication is not enabled.',
            ], 400);
        }

        $recoveryCodes = $user->generateRecoveryCodes();

        // Log the action
        AuditLog::log(
            '2fa_recovery_codes_regenerated',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'recovery_codes' => $recoveryCodes,
            'message' => 'Recovery codes have been regenerated successfully.',
        ]);
    }

    /**
     * Send Email OTP code.
     */
    public function sendEmailCode(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user already has a valid code
        if (TwoFactorCode::hasValidCode($user, 'email')) {
            return response()->json([
                'code' => 'code_already_sent',
                'message' => 'A verification code has already been sent. Please check your email or wait before requesting another.',
            ], 400);
        }

        // Generate and store the code
        $codeRecord = TwoFactorCode::generate($user, 'email');
        $code = TwoFactorCode::getCodeForLogging($user, 'email');

        // In development, log the code
        if (app()->environment('local', 'testing') && $code) {
            Log::info("2FA Email Code for {$user->email}: {$code}");
        }

        // Send email (in production)
        if (app()->environment('production')) {
            try {
                Mail::raw(
                    "Your 2FA verification code is: {$code}\n\nThis code will expire in 10 minutes.",
                    function ($message) use ($user) {
                        $message->to($user->email)
                            ->subject('Two-Factor Authentication Code');
                    }
                );
            } catch (\Exception $e) {
                Log::error("Failed to send 2FA email to {$user->email}: " . $e->getMessage());
                return response()->json([
                    'code' => 'email_send_failed',
                    'message' => 'Failed to send verification code. Please try again.',
                ], 500);
            }
        }

        return response()->json([
            'message' => 'Verification code sent to your email.',
            'expires_in_minutes' => 10,
        ]);
    }

    /**
     * Verify Email OTP code.
     */
    public function verifyEmailCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid code format.',
                'details' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $code = $request->code;

        if (!TwoFactorCode::verify($user, $code, 'email')) {
            AuditLog::log(
                '2fa_email_verify_failed',
                User::class,
                $user->id,
                ['ip_address' => $request->ip()],
                $user->id,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'code' => 'invalid_code',
                'message' => 'Invalid or expired verification code.',
            ], 400);
        }

        // Mark email 2FA as verified for this session
        $request->session()->put('2fa_email_verified', true);

        AuditLog::log(
            '2fa_email_verified',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Email verification successful.',
        ]);
    }
}