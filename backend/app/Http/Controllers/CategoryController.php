<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\CacheService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = CacheService::getCategories();
        return response()->json(['data' => $categories]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load('tools');
        return response()->json(['data' => $category]);
    }
}
