<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('Password123!'),
            'remember_token' => Str::random(10),
            'role_id' => Role::factory(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role_id' => 1, // Will be admin role
        ]);
    }

    /**
     * Create a manager user.
     */
    public function manager(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'role_id' => 2, // Will be manager role
        ]);
    }

    /**
     * Create a regular user.
     */
    public function user(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'role_id' => 3, // Will be user role
        ]);
    }
}
