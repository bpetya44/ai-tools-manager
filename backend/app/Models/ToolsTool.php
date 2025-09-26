<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolsTool extends Model
{
    use HasFactory;

    protected $table = 'tools_tools';

    protected $fillable = [
        'name',
        'url',
        'description',
        'category_id',
        'created_by',
    ];

    /**
     * Get the category that owns the tool.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ToolsCategory::class, 'category_id');
    }

    /**
     * Get the user that created the tool.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}