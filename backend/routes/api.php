<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ToolsToolController;

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

// Debug endpoint for testing PUT requests
Route::put('/debug-put', function (Request $request) {
    return response()->json([
        'method' => $request->method(),
        'content_type' => $request->header('Content-Type'),
        'raw_input' => $request->getContent(),
        'json_data' => json_decode($request->getContent(), true),
        'all_data' => $request->all(),
        'only_name' => $request->only(['name']),
    ]);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Public routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Tools API routes with RBAC
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

    // Create and update tools (Admin/Manager only)
    Route::middleware('role:admin,manager')->group(function () {
        Route::post('/tools', [ToolsToolController::class, 'store']);
        Route::put('/tools/{toolsTool}', [ToolsToolController::class, 'update']);
    });

    // Delete tools (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::delete('/tools/{toolsTool}', [ToolsToolController::class, 'destroy']);
    });
});