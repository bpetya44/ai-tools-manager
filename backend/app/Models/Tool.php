<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'website_url',
        'price',
        'price_type',
        'features',
        'logo_url',
        'category_id',
        'is_active',
        'popularity_score',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'popularity_score' => 'integer',
    ];

    /**
     * Get the category that owns the tool.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Scope a query to only include active tools.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order tools by popularity.
     */
    public function scopePopular($query)
    {
        return $query->orderBy('popularity_score', 'desc');
    }
}
