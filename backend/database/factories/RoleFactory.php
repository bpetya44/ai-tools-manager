<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->sentence(),
        ];
    }

    /**
     * Create an admin role.
     */
    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Administrator',
            'slug' => 'admin',
            'description' => 'Full system access and management capabilities',
        ]);
    }

    /**
     * Create a manager role.
     */
    public function manager(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Manager',
            'slug' => 'manager',
            'description' => 'Team management and content oversight',
        ]);
    }

    /**
     * Create a user role.
     */
    public function user(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'User',
            'slug' => 'user',
            'description' => 'Basic user access with limited permissions',
        ]);
    }
}
