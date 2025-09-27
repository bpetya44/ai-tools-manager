<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get the default 'user' role
        $userRole = \App\Models\Role::where('slug', 'user')->first();

        // Generate email verification token
        $verificationToken = Str::random(64);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $userRole->id,
            'email_verification_token' => $verificationToken,
        ]);

        // Log the registration
        AuditLog::log(
            'user_registered',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user->load('role'),
            'token' => $token,
            'verification_token' => $verificationToken, // Remove in production
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'two_factor_code' => 'nullable|string|size:6',
            'temp_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        // If temp_token is provided, this is a 2FA verification step
        if ($request->has('temp_token')) {
            return $this->verify2FALogin($request);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed login attempt
            AuditLog::log(
                'login_failed',
                User::class,
                $user?->id,
                ['reason' => 'invalid_credentials', 'ip_address' => $request->ip()],
                $user?->id,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'code' => 'invalid_credentials',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check if user is active
        if (!$user->isActive()) {
            AuditLog::log(
                'login_failed',
                User::class,
                $user->id,
                ['reason' => 'account_inactive', 'ip_address' => $request->ip()],
                $user->id,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'code' => 'account_inactive',
                'message' => 'Your account has been deactivated.'
            ], 401);
        }

        // Check if 2FA is required
        if ($user->hasTwoFactorEnabled()) {
            if (!$request->has('two_factor_code')) {
                // Create temporary token for 2FA verification
                $tempToken = $user->createToken('2fa-temp', ['2fa-verify'], now()->addMinutes(10))->plainTextToken;

                return response()->json([
                    'code' => 'two_factor_required',
                    'message' => 'Two-factor authentication code is required.',
                    'requires_2fa' => true,
                    'temp_token' => $tempToken,
                ], 422);
            }

            // Verify 2FA code
            $validCode = $this->google2fa->verifyKey($user->two_factor_secret, $request->two_factor_code);

            if (!$validCode) {
                // Check recovery codes
                $recoveryCode = $request->two_factor_code;
                if (!$user->useRecoveryCode($recoveryCode)) {
                    AuditLog::log(
                        'login_failed',
                        User::class,
                        $user->id,
                        ['reason' => 'invalid_2fa_code', 'ip_address' => $request->ip()],
                        $user->id,
                        $request->ip(),
                        $request->userAgent()
                    );

                    return response()->json([
                        'code' => 'invalid_2fa_code',
                        'message' => 'Invalid two-factor authentication code.',
                    ], 401);
                }
            }
        }

        $user->load('role');
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log successful login
        AuditLog::log(
            'login_successful',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    private function verify2FALogin(Request $request)
    {
        $tempToken = $request->temp_token;

        // Find the temporary token
        $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($tempToken);

        if (!$personalAccessToken || $personalAccessToken->tokenable_type !== User::class) {
            return response()->json([
                'code' => 'invalid_temp_token',
                'message' => 'Invalid or expired temporary token.',
            ], 401);
        }

        $user = $personalAccessToken->tokenable;

        // Verify 2FA code
        $validCode = $this->google2fa->verifyKey($user->two_factor_secret, $request->two_factor_code);

        if (!$validCode) {
            // Check recovery codes
            $recoveryCode = $request->two_factor_code;
            if (!$user->useRecoveryCode($recoveryCode)) {
                AuditLog::log(
                    'login_failed',
                    User::class,
                    $user->id,
                    ['reason' => 'invalid_2fa_code', 'ip_address' => $request->ip()],
                    $user->id,
                    $request->ip(),
                    $request->userAgent()
                );

                return response()->json([
                    'code' => 'invalid_2fa_code',
                    'message' => 'Invalid two-factor authentication code.',
                ], 401);
            }
        }

        // Revoke temporary token
        $personalAccessToken->delete();

        $user->load('role');
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log successful login
        AuditLog::log(
            'login_successful',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        // Log the logout
        AuditLog::log(
            'logout',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }
}