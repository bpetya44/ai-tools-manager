<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use App\Models\ToolsTool;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * List all users with search and pagination.
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::with('role');

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role_id') && $request->role_id) {
            $query->where('role_id', $request->role_id);
        }

        // Filter by status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * List all tools with search, filtering, and pagination for admin.
     */
    public function tools(Request $request): JsonResponse
    {
        $query = ToolsTool::with(['approver', 'category']);

        // Search by name or description
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Order by newest first
        $query->orderBy('created_at', 'desc');

        $tools = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => $tools->items(),
            'meta' => [
                'current_page' => $tools->currentPage(),
                'last_page' => $tools->lastPage(),
                'per_page' => $tools->perPage(),
                'total' => $tools->total(),
            ],
        ]);
    }

    /**
     * Get a specific user.
     */
    public function showUser(User $user): JsonResponse
    {
        $user->load('role');

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Update user role (Admin only).
     */
    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid role selection.',
                'details' => $validator->errors(),
            ], 422);
        }

        $oldRole = $user->role;
        $newRole = Role::find($request->role_id);

        $user->update(['role_id' => $request->role_id]);

        // Log the action
        AuditLog::log(
            'user_role_changed',
            User::class,
            $user->id,
            [
                'old_role' => $oldRole?->name,
                'new_role' => $newRole->name,
                'changed_by' => $request->user()->name,
            ],
            $request->user()->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => 'User role updated successfully.',
            'data' => $user->load('role'),
        ]);
    }

    /**
     * Activate/deactivate user.
     */
    public function toggleUserStatus(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'validation_error',
                'message' => 'Invalid status value.',
                'details' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $user->is_active;
        $newStatus = $request->boolean('is_active');

        $user->update(['is_active' => $newStatus]);

        // Log the action
        AuditLog::log(
            'user_status_changed',
            User::class,
            $user->id,
            [
                'old_status' => $oldStatus ? 'active' : 'inactive',
                'new_status' => $newStatus ? 'active' : 'inactive',
                'changed_by' => $request->user()->name,
            ],
            $request->user()->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'message' => $newStatus ? 'User activated successfully.' : 'User deactivated successfully.',
            'data' => $user->load('role'),
        ]);
    }

    /**
     * Get audit logs.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with('user');

        // Filter by user
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action
        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        // Filter by model type
        if ($request->has('model_type') && $request->model_type) {
            $query->where('model_type', $request->model_type);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Get roles for dropdown.
     */
    public function roles(): JsonResponse
    {
        $roles = Role::select('id', 'name', 'slug')->get();

        return response()->json([
            'data' => $roles,
        ]);
    }

    /**
     * Get dashboard stats.
     */
    public function dashboard(): JsonResponse
    {
        $toolStats = CacheService::getDashboardStats();

        $stats = array_merge($toolStats, [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'users_with_2fa' => User::where('two_factor_enabled', true)->count(),
            'recent_logins' => AuditLog::where('action', 'login_successful')
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
            'recent_audit_logs' => AuditLog::where('created_at', '>=', now()->subDays(7))
                ->count(),
        ]);

        return response()->json([
            'data' => $stats,
        ]);
    }
}