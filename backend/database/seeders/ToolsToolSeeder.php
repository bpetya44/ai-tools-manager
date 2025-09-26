<?php

namespace Database\Seeders;

use App\Models\ToolsCategory;
use App\Models\ToolsTool;
use App\Models\User;
use Illuminate\Database\Seeder;

class ToolsToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $analyticsCategory = ToolsCategory::where('name', 'Analytics')->first();
        $marketingCategory = ToolsCategory::where('name', 'Marketing')->first();
        $securityCategory = ToolsCategory::where('name', 'Security')->first();

        $adminUser = User::where('email', 'admin@example.com')->first();

        $tools = [
            // Analytics Tools
            [
                'name' => 'Google Analytics',
                'url' => 'https://analytics.google.com',
                'description' => 'Web analytics service that tracks and reports website traffic.',
                'category_id' => $analyticsCategory->id,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Mixpanel',
                'url' => 'https://mixpanel.com',
                'description' => 'Advanced analytics platform for tracking user interactions.',
                'category_id' => $analyticsCategory->id,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Hotjar',
                'url' => 'https://hotjar.com',
                'description' => 'Behavior analytics and user feedback platform.',
                'category_id' => $analyticsCategory->id,
                'created_by' => $adminUser->id,
            ],

            // Marketing Tools
            [
                'name' => 'HubSpot',
                'url' => 'https://hubspot.com',
                'description' => 'Inbound marketing, sales, and service platform.',
                'category_id' => $marketingCategory->id,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Mailchimp',
                'url' => 'https://mailchimp.com',
                'description' => 'Email marketing platform for small businesses.',
                'category_id' => $marketingCategory->id,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Buffer',
                'url' => 'https://buffer.com',
                'description' => 'Social media management platform.',
                'category_id' => $marketingCategory->id,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Canva',
                'url' => 'https://canva.com',
                'description' => 'Graphic design platform for creating visual content.',
                'category_id' => $marketingCategory->id,
                'created_by' => $adminUser->id,
            ],

            // Security Tools
            [
                'name' => '1Password',
                'url' => 'https://1password.com',
                'description' => 'Password manager and secure digital vault.',
                'category_id' => $securityCategory->id,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Auth0',
                'url' => 'https://auth0.com',
                'description' => 'Identity and access management platform.',
                'category_id' => $securityCategory->id,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Cloudflare',
                'url' => 'https://cloudflare.com',
                'description' => 'Web infrastructure and website security services.',
                'category_id' => $securityCategory->id,
                'created_by' => $adminUser->id,
            ],
        ];

        foreach ($tools as $toolData) {
            ToolsTool::firstOrCreate(
                ['name' => $toolData['name']],
                $toolData
            );
        }
    }
}