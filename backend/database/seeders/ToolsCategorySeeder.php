<?php

namespace Database\Seeders;

use App\Models\ToolsCategory;
use Illuminate\Database\Seeder;

class ToolsCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Analytics',
            'Marketing',
            'Security',
        ];

        foreach ($categories as $categoryName) {
            ToolsCategory::firstOrCreate(
                ['name' => $categoryName],
                ['name' => $categoryName]
            );
        }
    }
}