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

        // Use the JSON data for the update
        $toolsTool->fill($data);
        $result = $toolsTool->save();

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