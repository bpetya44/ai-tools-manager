<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tool_id',
        'user_id',
        'body',
    ];

    /**
     * Get the tool that owns the comment.
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(ToolsTool::class, 'tool_id');
    }

    /**
     * Get the user that owns the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
