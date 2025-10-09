<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ToolResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->url,
            'description' => $this->description,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ],
            'created_by' => $this->when($this->creator, function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'avg_rating' => $this->when(isset($this->ratings_avg_score), round($this->ratings_avg_score, 1)),
            'ratings_count' => $this->when(isset($this->ratings_count), $this->ratings_count),
            'user_rating' => $this->when(isset($this->user_rating), $this->user_rating),
            'user_rating_id' => $this->when(isset($this->user_rating_id), $this->user_rating_id),
            'comments' => $this->when(isset($this->comments), CommentResource::collection($this->comments)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}