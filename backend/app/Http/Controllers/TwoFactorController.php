<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // Generate QR code URL
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
}