<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrator',
                'slug' => 'admin',
                'description' => 'Full system access and management capabilities',
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Team management and content oversight',
            ],
            [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Basic user access with limited permissions',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}
