<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tool;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $developmentCategory = Category::where('slug', 'development')->first();
        $designCategory = Category::where('slug', 'design')->first();
        $productivityCategory = Category::where('slug', 'productivity')->first();

        $tools = [
            // Development Tools
            [
                'name' => 'VS Code',
                'slug' => 'vs-code',
                'description' => 'Free source-code editor made by Microsoft with support for debugging, embedded Git control, syntax highlighting, intelligent code completion, snippets, and code refactoring.',
                'website_url' => 'https://code.visualstudio.com/',
                'price' => null,
                'price_type' => 'free',
                'features' => ['Syntax Highlighting', 'Debugging', 'Git Integration', 'Extensions', 'IntelliSense'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
                'category_id' => $developmentCategory->id,
                'popularity_score' => 95,
            ],
            [
                'name' => 'GitHub',
                'slug' => 'github',
                'description' => 'Web-based version control and collaboration platform for software developers using Git.',
                'website_url' => 'https://github.com/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['Version Control', 'Issue Tracking', 'Pull Requests', 'Actions CI/CD', 'Packages'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
                'category_id' => $developmentCategory->id,
                'popularity_score' => 90,
            ],
            [
                'name' => 'Docker',
                'slug' => 'docker',
                'description' => 'Platform that enables developers to package applications into containers—lightweight, portable, self-sufficient units.',
                'website_url' => 'https://www.docker.com/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['Containerization', 'Orchestration', 'Registry', 'Docker Compose', 'Multi-platform'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
                'category_id' => $developmentCategory->id,
                'popularity_score' => 85,
            ],
            [
                'name' => 'Postman',
                'slug' => 'postman',
                'description' => 'Collaboration platform for API development with features for building, testing, and documenting APIs.',
                'website_url' => 'https://www.postman.com/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['API Testing', 'Documentation', 'Mocking', 'Monitoring', 'Collaboration'],
                'logo_url' => 'https://www.postman.com/favicon.ico',
                'category_id' => $developmentCategory->id,
                'popularity_score' => 80,
            ],

            // Design Tools
            [
                'name' => 'Figma',
                'slug' => 'figma',
                'description' => 'Collaborative interface design tool that runs in the browser with real-time collaboration features.',
                'website_url' => 'https://www.figma.com/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['Real-time Collaboration', 'Prototyping', 'Design Systems', 'Plugins', 'Auto Layout'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
                'category_id' => $designCategory->id,
                'popularity_score' => 92,
            ],
            [
                'name' => 'Adobe Photoshop',
                'slug' => 'adobe-photoshop',
                'description' => 'Professional raster graphics editor developed by Adobe for image editing, graphic design, and digital art.',
                'website_url' => 'https://www.adobe.com/products/photoshop.html',
                'price' => 20.99,
                'price_type' => 'paid',
                'features' => ['Image Editing', 'Layers', 'Filters', 'Brushes', 'Automation'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg',
                'category_id' => $designCategory->id,
                'popularity_score' => 88,
            ],
            [
                'name' => 'Sketch',
                'slug' => 'sketch',
                'description' => 'Vector graphics editor for macOS used primarily for user interface and user experience design.',
                'website_url' => 'https://www.sketch.com/',
                'price' => 9.00,
                'price_type' => 'paid',
                'features' => ['Vector Editing', 'Symbols', 'Artboards', 'Plugins', 'Prototyping'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg',
                'category_id' => $designCategory->id,
                'popularity_score' => 75,
            ],

            // Productivity Tools
            [
                'name' => 'Slack',
                'slug' => 'slack',
                'description' => 'Business communication platform that brings team communication and collaboration into one place.',
                'website_url' => 'https://slack.com/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['Team Chat', 'File Sharing', 'Integrations', 'Video Calls', 'Workflow Automation'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg',
                'category_id' => $productivityCategory->id,
                'popularity_score' => 87,
            ],
            [
                'name' => 'Notion',
                'slug' => 'notion',
                'description' => 'All-in-one workspace for notes, docs, wikis, tasks, and project management.',
                'website_url' => 'https://www.notion.so/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['Notes & Docs', 'Databases', 'Templates', 'Collaboration', 'API'],
                'logo_url' => 'https://www.notion.so/images/logo-ios.png',
                'category_id' => $productivityCategory->id,
                'popularity_score' => 82,
            ],
            [
                'name' => 'Trello',
                'slug' => 'trello',
                'description' => 'Web-based list-making application for organizing and prioritizing projects using boards, lists, and cards.',
                'website_url' => 'https://trello.com/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['Kanban Boards', 'Cards & Lists', 'Power-ups', 'Automation', 'Team Collaboration'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg',
                'category_id' => $productivityCategory->id,
                'popularity_score' => 78,
            ],
            [
                'name' => 'Zoom',
                'slug' => 'zoom',
                'description' => 'Video communications platform that provides video telephony and online chat services.',
                'website_url' => 'https://zoom.us/',
                'price' => null,
                'price_type' => 'freemium',
                'features' => ['Video Meetings', 'Screen Sharing', 'Recording', 'Breakout Rooms', 'Webinars'],
                'logo_url' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/zoom/zoom-original.svg',
                'category_id' => $productivityCategory->id,
                'popularity_score' => 85,
            ],
        ];

        foreach ($tools as $tool) {
            Tool::create($tool);
        }
    }
}
