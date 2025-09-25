<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles first
        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
            UserSeeder::class,
            ToolSeeder::class,
        ]);

        // Optional: Create additional random users for testing
        // User::factory(10)->create();
    }
}
