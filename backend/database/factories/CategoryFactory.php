<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->sentence(),
            'color' => fake()->hexColor(),
        ];
    }

    /**
     * Create a development tools category.
     */
    public function development(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Development Tools',
            'slug' => 'development',
            'description' => 'Tools for software development, coding, and programming',
            'color' => '#10B981', // Green
        ]);
    }

    /**
     * Create a design tools category.
     */
    public function design(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Design Tools',
            'slug' => 'design',
            'description' => 'Tools for UI/UX design, graphics, and visual content creation',
            'color' => '#8B5CF6', // Purple
        ]);
    }

    /**
     * Create a productivity tools category.
     */
    public function productivity(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Productivity Tools',
            'slug' => 'productivity',
            'description' => 'Tools to enhance productivity, collaboration, and workflow',
            'color' => '#3B82F6', // Blue
        ]);
    }
}
