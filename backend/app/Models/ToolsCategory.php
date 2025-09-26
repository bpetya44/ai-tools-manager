<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ToolsCategory extends Model
{
    use HasFactory;

    protected $table = 'tools_categories';

    protected $fillable = [
        'name',
    ];

    /**
     * Get the tools for the category.
     */
    public function tools(): HasMany
    {
        return $this->hasMany(ToolsTool::class, 'category_id');
    }
}