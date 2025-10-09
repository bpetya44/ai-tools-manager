<?php

namespace Database\Seeders;

use App\Models\ToolsCategory;
use App\Models\ToolsTool;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $developmentCategory = ToolsCategory::where('name', 'Development Tools')->first();
        $designCategory = ToolsCategory::where('name', 'Design Tools')->first();
        $productivityCategory = ToolsCategory::where('name', 'Productivity Tools')->first();

        $tools = [
            // Development Tools
            [
                'name' => 'VS Code',
                'url' => 'https://code.visualstudio.com/',
                'description' => 'Free source-code editor made by Microsoft with support for debugging, embedded Git control, syntax highlighting, intelligent code completion, snippets, and code refactoring.',
                'category_id' => $developmentCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'GitHub',
                'url' => 'https://github.com/',
                'description' => 'Web-based version control and collaboration platform for software developers using Git.',
                'category_id' => $developmentCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'Docker',
                'url' => 'https://www.docker.com/',
                'description' => 'Platform that enables developers to package applications into containers—lightweight, portable, self-sufficient units.',
                'category_id' => $developmentCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'Postman',
                'url' => 'https://www.postman.com/',
                'description' => 'Collaboration platform for API development with features for building, testing, and documenting APIs.',
                'category_id' => $developmentCategory->id,
                'status' => 'approved',
            ],

            // Design Tools
            [
                'name' => 'Figma',
                'url' => 'https://www.figma.com/',
                'description' => 'Collaborative interface design tool that runs in the browser with real-time collaboration features.',
                'category_id' => $designCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'Adobe Photoshop',
                'url' => 'https://www.adobe.com/products/photoshop.html',
                'description' => 'Professional raster graphics editor developed by Adobe for image editing, graphic design, and digital art.',
                'category_id' => $designCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'Sketch',
                'url' => 'https://www.sketch.com/',
                'description' => 'Vector graphics editor for macOS used primarily for user interface and user experience design.',
                'category_id' => $designCategory->id,
                'status' => 'approved',
            ],

            // Productivity Tools
            [
                'name' => 'Slack',
                'url' => 'https://slack.com/',
                'description' => 'Business communication platform that brings team communication and collaboration into one place.',
                'category_id' => $productivityCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'Notion',
                'url' => 'https://www.notion.so/',
                'description' => 'All-in-one workspace for notes, docs, wikis, tasks, and project management.',
                'category_id' => $productivityCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'Trello',
                'url' => 'https://trello.com/',
                'description' => 'Web-based list-making application for organizing and prioritizing projects using boards, lists, and cards.',
                'category_id' => $productivityCategory->id,
                'status' => 'approved',
            ],
            [
                'name' => 'Zoom',
                'url' => 'https://zoom.us/',
                'description' => 'Video communications platform that provides video telephony and online chat services.',
                'category_id' => $productivityCategory->id,
                'status' => 'approved',
            ],
        ];

        foreach ($tools as $tool) {
            ToolsTool::firstOrCreate(
                ['name' => $tool['name']],
                $tool
            );
        }
    }
}
