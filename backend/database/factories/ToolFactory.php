<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tool>
 */
class ToolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $priceTypes = ['free', 'freemium', 'paid'];
        $priceType = fake()->randomElement($priceTypes);

        $price = null;
        if ($priceType === 'paid') {
            $price = fake()->randomFloat(2, 5, 500);
        } elseif ($priceType === 'freemium') {
            $price = fake()->randomFloat(2, 0, 50);
        }

        return [
            'name' => fake()->words(2, true),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->paragraph(),
            'website_url' => fake()->url(),
            'price' => $price,
            'price_type' => $priceType,
            'features' => fake()->words(5),
            'logo_url' => 'https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=' . fake()->randomLetter(),
            'category_id' => Category::factory(),
            'is_active' => true,
            'popularity_score' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Create a free tool.
     */
    public function free(): static
    {
        return $this->state(fn(array $attributes) => [
            'price' => null,
            'price_type' => 'free',
        ]);
    }

    /**
     * Create a freemium tool.
     */
    public function freemium(): static
    {
        return $this->state(fn(array $attributes) => [
            'price' => fake()->randomFloat(2, 0, 50),
            'price_type' => 'freemium',
        ]);
    }

    /**
     * Create a paid tool.
     */
    public function paid(): static
    {
        return $this->state(fn(array $attributes) => [
            'price' => fake()->randomFloat(2, 10, 500),
            'price_type' => 'paid',
        ]);
    }
}
