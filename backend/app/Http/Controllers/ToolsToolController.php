<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\ToolsTool;
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

        // Pagination
        $perPage = $request->get('per_page', 15);
        $tools = $query->orderBy('created_at', 'desc')->paginate($perPage);

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
    public function store(StoreToolRequest $request): JsonResponse
    {
        $tool = ToolsTool::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        $tool->load(['category', 'creator']);

        return response()->json([
            'message' => 'Tool created successfully',
            'data' => new ToolResource($tool),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ToolsTool $toolsTool): JsonResponse
    {
        $toolsTool->load(['category', 'creator']);

        return response()->json([
            'data' => new ToolResource($toolsTool),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateToolRequest $request, ToolsTool $toolsTool): JsonResponse
    {
        $toolsTool->update($request->validated());
        $toolsTool->load(['category', 'creator']);

        return response()->json([
            'message' => 'Tool updated successfully',
            'data' => new ToolResource($toolsTool),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ToolsTool $toolsTool): JsonResponse
    {
        $toolsTool->delete();

        return response()->json([
            'message' => 'Tool deleted successfully',
        ]);
    }
}