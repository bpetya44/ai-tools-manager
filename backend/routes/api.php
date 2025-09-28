<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\ToolsToolController;
use App\Http\Controllers\TwoFactorController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/status', function () {
    return response()->json(['status' => 'API is running']);
});

Route::get('/health', function () {
    return response()->json([
        'ok' => true,
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
        'environment' => app()->environment(),
    ]);
});

// Debug endpoint removed for production

// Authentication routes with throttling
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1'); // 5 attempts per minute
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // 5 attempts per minute
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Password reset routes
Route::post('/password/reset-request', [PasswordResetController::class, 'requestReset'])->middleware('throttle:3,1');
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:3,1');
Route::post('/email/verify', [PasswordResetController::class, 'verifyEmail']);
Route::post('/email/resend-verification', [PasswordResetController::class, 'resendVerification'])->middleware('throttle:3,1');

// Public routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// 2FA routes with authentication
Route::get('/two-factor-status', function () {
    return response()->json([
        'enabled' => false,
        'confirmed_at' => null,
    ]);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/2fa/enable', [TwoFactorController::class, 'enable']);
    Route::post('/2fa/verify', [TwoFactorController::class, 'verify']);
    Route::post('/2fa/disable', [TwoFactorController::class, 'disable']);
    Route::post('/2fa/regenerate-recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes']);

    // Email OTP routes
    Route::post('/2fa/email/send', [TwoFactorController::class, 'sendEmailCode']);
    Route::post('/2fa/email/verify', [TwoFactorController::class, 'verifyEmailCode']);
});

// Admin routes (Admin only)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/users/{user}', [AdminController::class, 'showUser']);
    Route::put('/admin/users/{user}/role', [AdminController::class, 'updateUserRole']);
    Route::put('/admin/users/{user}/status', [AdminController::class, 'toggleUserStatus']);
    Route::get('/admin/tools', [AdminController::class, 'tools']);
    Route::get('/admin/audit-logs', [AdminController::class, 'auditLogs']);
    Route::get('/admin/roles', [AdminController::class, 'roles']);
});

// Tools API routes with RBAC and throttling
Route::middleware('auth:sanctum')->group(function () {
    // Get categories for tools (all authenticated users)
    Route::get('/tools-categories', function () {
        return response()->json([
            'data' => \App\Models\ToolsCategory::all(['id', 'name']),
        ]);
    });

    // List and view tools (all authenticated users)
    Route::get('/tools', [ToolsToolController::class, 'index']);
    Route::get('/tools/{toolsTool}', [ToolsToolController::class, 'show']);

    // Create and update tools (Admin/Manager only) with throttling
    Route::middleware(['role:admin,manager', 'throttle:10,1'])->group(function () {
        Route::post('/tools', [ToolsToolController::class, 'store']);
        Route::put('/tools/{toolsTool}', [ToolsToolController::class, 'update']);
    });

    // Delete tools (Admin only) with throttling
    Route::middleware(['role:admin', 'throttle:5,1'])->group(function () {
        Route::delete('/tools/{toolsTool}', [ToolsToolController::class, 'destroy']);
    });

    // Tool approval routes (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/tools/{toolsTool}/approve', [ToolsToolController::class, 'approve']);
        Route::post('/tools/{toolsTool}/reject', [ToolsToolController::class, 'reject']);
    });

    // Comments routes
    Route::post('/tools/{toolsTool}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Ratings routes
    Route::post('/tools/{toolsTool}/rating', [RatingController::class, 'store']);
    Route::delete('/ratings/{rating}', [RatingController::class, 'destroy']);
});