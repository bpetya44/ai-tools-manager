<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use Illuminate\Http\Request;

class ToolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Tool::with('category')->active();

        // Filter by category if provided
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by price type if provided
        if ($request->has('price_type')) {
            $query->where('price_type', $request->price_type);
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort by popularity by default
        $tools = $query->popular()->paginate(12);

        return response()->json([
            'data' => $tools->items(),
            'pagination' => [
                'current_page' => $tools->currentPage(),
                'last_page' => $tools->lastPage(),
                'per_page' => $tools->perPage(),
                'total' => $tools->total(),
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tool $tool)
    {
        $tool->load('category');
        return response()->json(['data' => $tool]);
    }
}
