<?php

namespace App\Policies;

use App\Models\ToolsTool;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ToolsToolPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view tools
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ToolsTool $toolsTool): bool
    {
        return true; // All authenticated users can view individual tools
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role->slug, ['admin', 'manager']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ToolsTool $toolsTool): bool
    {
        return in_array($user->role->slug, ['admin', 'manager']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ToolsTool $toolsTool): bool
    {
        return $user->role->slug === 'admin';
    }
}