<?php

namespace Database\Seeders;

use App\Models\ToolsCategory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Development Tools',
            'Design Tools',
            'Productivity Tools',
            'Marketing Tools',
            'Analytics Tools',
        ];

        foreach ($categories as $categoryName) {
            ToolsCategory::firstOrCreate(
                ['name' => $categoryName]
            );
        }
    }
}
