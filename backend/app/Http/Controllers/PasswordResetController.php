<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Request password reset.
     */
    public function requestReset(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid email address.',
                'details' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Generate reset token
        $token = Str::random(64);
        $expiresAt = now()->addHours(1); // Token expires in 1 hour

        $user->update([
            'password_reset_token' => $token,
            'password_reset_token_expires_at' => $expiresAt,
        ]);

        // Log the action
        AuditLog::log(
            'password_reset_requested',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        // In a real application, you would send an email here
        // For now, we'll return the token for testing
        return response()->json([
            'message' => 'Password reset instructions have been sent to your email.',
            'reset_token' => $token, // Remove this in production
        ]);
    }

    /**
     * Reset password with token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid input data.',
                'details' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)
            ->where('password_reset_token', $request->token)
            ->where('password_reset_token_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json([
                'code' => 'invalid_token',
                'message' => 'Invalid or expired reset token.',
            ], 400);
        }

        // Update password and clear reset token
        $user->update([
            'password' => Hash::make($request->password),
            'password_reset_token' => null,
            'password_reset_token_expires_at' => null,
        ]);

        // Log the action
        AuditLog::log(
            'password_reset_completed',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Password has been reset successfully.',
        ]);
    }

    /**
     * Verify email address.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid input data.',
                'details' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)
            ->where('email_verification_token', $request->token)
            ->first();

        if (!$user) {
            return response()->json([
                'code' => 'invalid_token',
                'message' => 'Invalid verification token.',
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'code' => 'already_verified',
                'message' => 'Email address is already verified.',
            ], 400);
        }

        // Verify email
        $user->update([
            'email_verified_at' => now(),
            'email_verification_token' => null,
        ]);

        // Log the action
        AuditLog::log(
            'email_verified',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'Email address has been verified successfully.',
        ]);
    }

    /**
     * Resend email verification.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid email address.',
                'details' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'code' => 'already_verified',
                'message' => 'Email address is already verified.',
            ], 400);
        }

        // Generate new verification token
        $token = Str::random(64);
        $user->update(['email_verification_token' => $token]);

        // Log the action
        AuditLog::log(
            'email_verification_resent',
            User::class,
            $user->id,
            ['ip_address' => $request->ip()],
            $user->id,
            $request->ip(),
            $request->userAgent()
        );

        // In a real application, you would send an email here
        // For now, we'll return the token for testing
        return response()->json([
            'message' => 'Verification email has been sent.',
            'verification_token' => $token, // Remove this in production
        ]);
    }
}