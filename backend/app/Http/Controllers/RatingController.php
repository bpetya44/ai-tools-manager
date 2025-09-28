<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\ToolsTool;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    /**
     * Store or update a rating for a tool.
     */
    public function store(Request $request, ToolsTool $toolsTool): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'score' => 'required|integer|between:1,5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'VALIDATION_ERROR',
                'message' => 'The given data was invalid',
                'details' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id;
        $score = $request->score;

        // Use updateOrCreate to handle upsert
        $rating = Rating::updateOrCreate(
            [
                'tool_id' => $toolsTool->id,
                'user_id' => $userId,
            ],
            [
                'score' => $score,
            ]
        );

        // Invalidate tool detail cache
        CacheService::invalidateToolDetail($toolsTool->id);

        $isUpdate = $rating->wasRecentlyCreated === false;

        return response()->json([
            'message' => $isUpdate ? 'Rating updated successfully' : 'Rating created successfully',
            'data' => [
                'id' => $rating->id,
                'score' => $rating->score,
                'tool_id' => $rating->tool_id,
                'user_id' => $rating->user_id,
                'created_at' => $rating->created_at,
                'updated_at' => $rating->updated_at,
            ],
        ], $isUpdate ? 200 : 201);
    }

    /**
     * Remove the specified rating.
     */
    public function destroy(Request $request, Rating $rating): JsonResponse
    {
        // Check if user can delete this rating
        $user = $request->user();
        $canDelete = $rating->user_id === $user->id ||
            in_array($user->role->slug, ['admin', 'manager']);

        if (!$canDelete) {
            return response()->json([
                'code' => 'FORBIDDEN',
                'message' => 'You are not authorized to delete this rating',
            ], 403);
        }

        $toolId = $rating->tool_id;
        $rating->delete();

        // Invalidate tool detail cache
        CacheService::invalidateToolDetail($toolId);

        return response()->json([
            'message' => 'Rating deleted successfully',
        ], 204);
    }
}
