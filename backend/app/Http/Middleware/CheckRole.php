<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'code' => 'UNAUTHORIZED',
                'message' => 'Authentication required',
            ], 401);
        }

        $userRole = $user->role->slug ?? null;

        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json([
                'code' => 'FORBIDDEN',
                'message' => 'Insufficient permissions',
            ], 403);
        }

        return $next($request);
    }
}