<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Development Tools',
                'slug' => 'development',
                'description' => 'Tools for software development, coding, and programming',
                'color' => '#10B981', // Green
            ],
            [
                'name' => 'Design Tools',
                'slug' => 'design',
                'description' => 'Tools for UI/UX design, graphics, and visual content creation',
                'color' => '#8B5CF6', // Purple
            ],
            [
                'name' => 'Productivity Tools',
                'slug' => 'productivity',
                'description' => 'Tools to enhance productivity, collaboration, and workflow',
                'color' => '#3B82F6', // Blue
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
