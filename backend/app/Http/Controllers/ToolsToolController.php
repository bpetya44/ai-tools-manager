<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\AuditLog;
use App\Models\ToolsTool;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ToolsToolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ToolsTool::with(['category', 'creator']);

        // Search by name
        if ($request->has('q') && !empty($request->q)) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        // Filter by category
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $tools = $query->with(['category', 'creator', 'approver'])
            ->withAvg('ratings', 'score')
            ->withCount('ratings')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => ToolResource::collection($tools->items()),
            'meta' => [
                'current_page' => $tools->currentPage(),
                'last_page' => $tools->lastPage(),
                'per_page' => $tools->perPage(),
                'total' => $tools->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Get JSON data from request body
        $jsonData = json_decode($request->getContent(), true) ?: [];

        // Manual validation using the JSON data
        $validator = \Validator::make($jsonData, [
            'name' => 'required|string|max:120',
            'url' => 'required|url|max:255',
            'category_id' => 'required|exists:tools_categories,id',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'VALIDATION_ERROR',
                'message' => 'The given data was invalid',
                'details' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        // Use the JSON data for the creation
        $tool = ToolsTool::create([
            ...$jsonData,
            'created_by' => $request->user()->id,
        ]);

        $tool->load(['category', 'creator']);

        // Log the creation
        AuditLog::log(
            'tool_created',
            ToolsTool::class,
            $tool->id,
            [
                'tool_name' => $tool->name,
                'category_id' => $tool->category_id,
                'ip_address' => $request->ip(),
            ],
            $request->user()->id,
            $request->ip(),
            $request->userAgent()
        );

        // Invalidate cache
        CacheService::invalidateToolCounts();

        return response()->json([
            'message' => 'Tool created successfully',
            'data' => new ToolResource($tool),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, ToolsTool $toolsTool): JsonResponse
    {
        // Use cache service for tool detail
        $cachedTool = CacheService::getToolDetail($toolsTool->id);

        if (!$cachedTool) {
            return response()->json([
                'code' => 'NOT_FOUND',
                'message' => 'Tool not found',
            ], 404);
        }

        // Get user's current rating if authenticated
        $userRating = null;
        if ($request->user()) {
            $userRating = $cachedTool->ratings()
                ->where('user_id', $request->user()->id)
                ->first();
        }

        // Add user rating to the tool data
        $cachedTool->user_rating = $userRating ? $userRating->score : null;
        $cachedTool->user_rating_id = $userRating ? $userRating->id : null;

        return response()->json([
            'data' => new ToolResource($cachedTool),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ToolsTool $toolsTool): JsonResponse
    {
        // Get JSON data from request body
        $jsonData = json_decode($request->getContent(), true) ?: [];

        // Manual validation for only the fields that are present
        $rules = [];
        $data = [];

        if (isset($jsonData['name'])) {
            $rules['name'] = 'string|max:120';
            $data['name'] = $jsonData['name'];
        }
        if (isset($jsonData['url'])) {
            $rules['url'] = 'url|max:255';
            $data['url'] = $jsonData['url'];
        }
        if (isset($jsonData['category_id'])) {
            $rules['category_id'] = 'exists:tools_categories,id';
            $data['category_id'] = $jsonData['category_id'];
        }
        if (isset($jsonData['description'])) {
            $rules['description'] = 'nullable|string|max:500';
            $data['description'] = $jsonData['description'];
        }

        // Validate the data
        $validatedData = $request->validate($rules);

        // Store old values for audit log
        $oldValues = $toolsTool->toArray();

        // Use the JSON data for the update
        $toolsTool->fill($data);
        $result = $toolsTool->save();

        $toolsTool->load(['category', 'creator']);

        // Log the update
        AuditLog::log(
            'tool_updated',
            ToolsTool::class,
            $toolsTool->id,
            [
                'tool_name' => $toolsTool->name,
                'old_values' => $oldValues,
                'new_values' => $toolsTool->toArray(),
                'changed_fields' => array_keys($data),
                'ip_address' => $request->ip(),
            ],
            $request->user()->id,
            $request->ip(),
            $request->userAgent()
        );

        // Invalidate cache
        CacheService::invalidateToolCounts();

        return response()->json([
            'message' => 'Tool updated successfully',
            'data' => new ToolResource($toolsTool),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ToolsTool $toolsTool): JsonResponse
    {
        // Store tool data for audit log before deletion
        $toolData = $toolsTool->toArray();

        $toolsTool->delete();

        // Log the deletion
        AuditLog::log(
            'tool_deleted',
            ToolsTool::class,
            $toolsTool->id,
            [
                'tool_name' => $toolData['name'],
                'category_id' => $toolData['category_id'],
                'ip_address' => $request->ip(),
            ],
            $request->user()->id,
            $request->ip(),
            $request->userAgent()
        );

        // Invalidate cache
        CacheService::invalidateToolCounts();

        return response()->json([
            'message' => 'Tool deleted successfully',
        ]);
    }

    /**
     * Approve a tool (Admin only).
     */
    public function approve(Request $request, ToolsTool $toolsTool): JsonResponse
    {
        $toolsTool->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        AuditLog::log(
            'tool_approved',
            ToolsTool::class,
            $toolsTool->id,
            [
                'tool_name' => $toolsTool->name,
                'approved_by' => $request->user()->name,
                'ip_address' => $request->ip(),
            ],
            $request->user()->id,
            $request->ip(),
            $request->userAgent()
        );

        // Invalidate cache
        CacheService::invalidateToolCounts();

        return response()->json([
            'message' => 'Tool approved successfully',
            'data' => new ToolResource($toolsTool->load(['category', 'creator', 'approver'])),
        ]);
    }

    /**
     * Reject a tool (Admin only).
     */
    public function reject(Request $request, ToolsTool $toolsTool): JsonResponse
    {
        $toolsTool->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
        ]);

        AuditLog::log(
            'tool_rejected',
            ToolsTool::class,
            $toolsTool->id,
            [
                'tool_name' => $toolsTool->name,
                'rejected_by' => $request->user()->name,
                'ip_address' => $request->ip(),
            ],
            $request->user()->id,
            $request->ip(),
            $request->userAgent()
        );

        // Invalidate cache
        CacheService::invalidateToolCounts();

        return response()->json([
            'message' => 'Tool rejected successfully',
            'data' => new ToolResource($toolsTool->load(['category', 'creator', 'approver'])),
        ]);
    }
}