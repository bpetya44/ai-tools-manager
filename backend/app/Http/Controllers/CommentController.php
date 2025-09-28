<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\ToolsTool;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Store a newly created comment.
     */
    public function store(Request $request, ToolsTool $toolsTool): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'body' => 'required|string|min:1|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'VALIDATION_ERROR',
                'message' => 'The given data was invalid',
                'details' => $validator->errors(),
            ], 422);
        }

        $comment = Comment::create([
            'tool_id' => $toolsTool->id,
            'user_id' => $request->user()->id,
            'body' => $request->body,
        ]);

        $comment->load('user');

        // Invalidate tool detail cache
        CacheService::invalidateToolDetail($toolsTool->id);

        return response()->json([
            'message' => 'Comment created successfully',
            'data' => new CommentResource($comment),
        ], 201);
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        // Check if user can delete this comment
        $user = $request->user();
        $canDelete = $comment->user_id === $user->id ||
            in_array($user->role->slug, ['admin', 'manager']);

        if (!$canDelete) {
            return response()->json([
                'code' => 'FORBIDDEN',
                'message' => 'You are not authorized to delete this comment',
            ], 403);
        }

        $toolId = $comment->tool_id;
        $comment->delete();

        // Invalidate tool detail cache
        CacheService::invalidateToolDetail($toolId);

        return response()->json([
            'message' => 'Comment deleted successfully',
        ], 204);
    }
}
