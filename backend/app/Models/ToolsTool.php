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
        'status',
        'approved_at',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

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

    /**
     * Get the user that approved the tool.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope for approved tools.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for pending tools.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for rejected tools.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}