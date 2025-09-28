<?php

namespace App\Services;

use App\Models\ToolsCategory;
use App\Models\ToolsTool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    const CATEGORIES_TTL = 600; // 10 minutes
    const TOOL_COUNTS_TTL = 120; // 2 minutes
    const TOOL_DETAIL_TTL = 90; // 1.5 minutes
    const CACHE_ENABLED = true;

    /**
     * Get categories with caching.
     */
    public static function getCategories()
    {
        if (!self::CACHE_ENABLED) {
            return ToolsCategory::orderBy('name')->get();
        }

        return Cache::remember('categories:index', self::CATEGORIES_TTL, function () {
            return ToolsCategory::orderBy('name')->get();
        });
    }

    /**
     * Get tool counts by status with caching.
     */
    public static function getToolCountsByStatus(): array
    {
        if (!self::CACHE_ENABLED) {
            return [
                'total' => ToolsTool::count(),
                'approved' => ToolsTool::approved()->count(),
                'pending' => ToolsTool::pending()->count(),
                'rejected' => ToolsTool::rejected()->count(),
            ];
        }

        return Cache::remember('tools:count:status', self::TOOL_COUNTS_TTL, function () {
            return [
                'total' => ToolsTool::count(),
                'approved' => ToolsTool::approved()->count(),
                'pending' => ToolsTool::pending()->count(),
                'rejected' => ToolsTool::rejected()->count(),
            ];
        });
    }

    /**
     * Get tool counts by category with caching.
     */
    public static function getToolCountsByCategory(): array
    {
        if (!self::CACHE_ENABLED) {
            return ToolsTool::selectRaw('category_id, status, COUNT(*) as count')
                ->groupBy('category_id', 'status')
                ->get()
                ->groupBy('category_id')
                ->map(function ($categoryTools) {
                    return $categoryTools->keyBy('status')->map(function ($item) {
                        return $item->count;
                    });
                })
                ->toArray();
        }

        return Cache::remember('tools:count:category', self::TOOL_COUNTS_TTL, function () {
            return ToolsTool::selectRaw('category_id, status, COUNT(*) as count')
                ->groupBy('category_id', 'status')
                ->get()
                ->groupBy('category_id')
                ->map(function ($categoryTools) {
                    return $categoryTools->keyBy('status')->map(function ($item) {
                        return $item->count;
                    });
                })
                ->toArray();
        });
    }

    /**
     * Invalidate category cache.
     */
    public static function invalidateCategories()
    {
        if (self::CACHE_ENABLED) {
            Cache::forget('categories:index');
            Log::info('Categories cache invalidated');
        }
    }

    /**
     * Invalidate tool count caches.
     */
    public static function invalidateToolCounts()
    {
        if (self::CACHE_ENABLED) {
            Cache::forget('tools:count:status');
            Cache::forget('tools:count:category');
            Log::info('Tool counts cache invalidated');
        }
    }

    /**
     * Invalidate all caches.
     */
    public static function invalidateAll()
    {
        self::invalidateCategories();
        self::invalidateToolCounts();
    }

    /**
     * Get dashboard stats with caching.
     */
    public static function getDashboardStats(): array
    {
        if (!self::CACHE_ENABLED) {
            return array_merge(
                self::getToolCountsByStatus(),
                ['by_category' => self::getToolCountsByCategory()]
            );
        }

        return Cache::remember('dashboard:stats', self::TOOL_COUNTS_TTL, function () {
            return array_merge(
                self::getToolCountsByStatus(),
                ['by_category' => self::getToolCountsByCategory()]
            );
        });
    }

    /**
     * Get tool detail with caching.
     */
    public static function getToolDetail(int $toolId)
    {
        if (!self::CACHE_ENABLED) {
            return ToolsTool::with([
                'category',
                'creator',
                'comments' => function ($query) {
                    $query->with('user')->latest()->limit(10);
                }
            ])
                ->withAvg('ratings', 'score')
                ->withCount('ratings')
                ->find($toolId);
        }

        return Cache::remember("tool:show:{$toolId}", self::TOOL_DETAIL_TTL, function () use ($toolId) {
            return ToolsTool::with([
                'category',
                'creator',
                'comments' => function ($query) {
                    $query->with('user')->latest()->limit(10);
                }
            ])
                ->withAvg('ratings', 'score')
                ->withCount('ratings')
                ->find($toolId);
        });
    }

    /**
     * Invalidate tool detail cache.
     */
    public static function invalidateToolDetail(int $toolId)
    {
        if (self::CACHE_ENABLED) {
            Cache::forget("tool:show:{$toolId}");
            Log::info("Tool detail cache invalidated for tool ID: {$toolId}");
        }
    }

    /**
     * Clear all caches.
     */
    public static function clearAll()
    {
        if (self::CACHE_ENABLED) {
            Cache::forget('categories:index');
            Cache::forget('tools:count:status');
            Cache::forget('tools:count:category');
            Cache::forget('dashboard:stats');
            // Clear all tool detail caches
            Cache::flush();
            Log::info('All caches cleared');
        }
    }
}
