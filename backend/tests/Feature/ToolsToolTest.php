<?php

namespace Tests\Feature;

use App\Models\ToolsCategory;
use App\Models\ToolsTool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ToolsToolTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed the database
        $this->seed();
    }

    public function test_authenticated_user_can_list_tools(): void
    {
        $user = User::where('email', 'user@example.com')->first();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tools');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'url',
                        'description',
                        'category' => ['id', 'name'],
                        'created_by' => ['id', 'name', 'email'],
                        'created_at',
                        'updated_at',
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ]
            ]);
    }

    public function test_authenticated_user_can_search_tools(): void
    {
        $user = User::where('email', 'user@example.com')->first();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tools?q=Google');

        $response->assertStatus(200);
        $data = $response->json();

        // Should find Google Analytics
        $this->assertCount(1, $data['data']);
        $this->assertEquals('Google Analytics', $data['data'][0]['name']);
    }

    public function test_authenticated_user_can_filter_tools_by_category(): void
    {
        $user = User::where('email', 'user@example.com')->first();
        Sanctum::actingAs($user);

        $analyticsCategory = ToolsCategory::where('name', 'Analytics')->first();

        $response = $this->getJson("/api/tools?category_id={$analyticsCategory->id}");

        $response->assertStatus(200);
        $data = $response->json();

        // Should find only Analytics tools
        foreach ($data['data'] as $tool) {
            $this->assertEquals('Analytics', $tool['category']['name']);
        }
    }

    public function test_regular_user_cannot_create_tools(): void
    {
        $user = User::where('email', 'user@example.com')->first();
        Sanctum::actingAs($user);

        $category = ToolsCategory::first();

        $response = $this->postJson('/api/tools', [
            'name' => 'Test Tool',
            'url' => 'https://example.com',
            'description' => 'A test tool',
            'category_id' => $category->id,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'code' => 'FORBIDDEN',
                'message' => 'Insufficient permissions',
            ]);
    }

    public function test_manager_can_create_tools(): void
    {
        $manager = User::where('email', 'manager@example.com')->first();
        Sanctum::actingAs($manager);

        $category = ToolsCategory::first();

        $response = $this->postJson('/api/tools', [
            'name' => 'Test Tool',
            'url' => 'https://example.com',
            'description' => 'A test tool',
            'category_id' => $category->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'url',
                    'description',
                    'category',
                    'created_by',
                    'created_at',
                    'updated_at',
                ]
            ]);

        $this->assertDatabaseHas('tools_tools', [
            'name' => 'Test Tool',
            'url' => 'https://example.com',
            'created_by' => $manager->id,
        ]);
    }

    public function test_admin_can_create_tools(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        Sanctum::actingAs($admin);

        $category = ToolsCategory::first();

        $response = $this->postJson('/api/tools', [
            'name' => 'Admin Tool',
            'url' => 'https://admin.example.com',
            'description' => 'An admin tool',
            'category_id' => $category->id,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('tools_tools', [
            'name' => 'Admin Tool',
            'created_by' => $admin->id,
        ]);
    }

    public function test_manager_can_update_tools(): void
    {
        $manager = User::where('email', 'manager@example.com')->first();
        Sanctum::actingAs($manager);

        $tool = ToolsTool::first();
        $category = ToolsCategory::first();

        $response = $this->putJson("/api/tools/{$tool->id}", [
            'name' => 'Updated Tool Name',
            'url' => 'https://updated.example.com',
            'description' => 'Updated description',
            'category_id' => $category->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tool updated successfully',
                'data' => [
                    'id' => $tool->id,
                    'name' => 'Updated Tool Name',
                ]
            ]);

        $this->assertDatabaseHas('tools_tools', [
            'id' => $tool->id,
            'name' => 'Updated Tool Name',
        ]);
    }

    public function test_regular_user_cannot_update_tools(): void
    {
        $user = User::where('email', 'user@example.com')->first();
        Sanctum::actingAs($user);

        $tool = ToolsTool::first();
        $category = ToolsCategory::first();

        $response = $this->putJson("/api/tools/{$tool->id}", [
            'name' => 'Updated Tool Name',
            'url' => 'https://updated.example.com',
            'description' => 'Updated description',
            'category_id' => $category->id,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'code' => 'FORBIDDEN',
                'message' => 'Insufficient permissions',
            ]);
    }

    public function test_only_admin_can_delete_tools(): void
    {
        $manager = User::where('email', 'manager@example.com')->first();
        Sanctum::actingAs($manager);

        $tool = ToolsTool::first();

        $response = $this->deleteJson("/api/tools/{$tool->id}");

        $response->assertStatus(403)
            ->assertJson([
                'code' => 'FORBIDDEN',
                'message' => 'Insufficient permissions',
            ]);
    }

    public function test_admin_can_delete_tools(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        Sanctum::actingAs($admin);

        $tool = ToolsTool::first();

        $response = $this->deleteJson("/api/tools/{$tool->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tool deleted successfully',
            ]);

        $this->assertDatabaseMissing('tools_tools', [
            'id' => $tool->id,
        ]);
    }

    public function test_validation_errors_on_invalid_tool_data(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/tools', [
            'name' => '', // Invalid: empty name
            'url' => 'not-a-url', // Invalid: not a URL
            'category_id' => 999, // Invalid: category doesn't exist
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'code',
                'message',
                'details' => [
                    'name',
                    'url',
                    'category_id',
                ]
            ]);
    }

    public function test_unauthenticated_user_cannot_access_tools(): void
    {
        $response = $this->getJson('/api/tools');

        $response->assertStatus(401)
            ->assertJson([
                'code' => 'UNAUTHORIZED',
                'message' => 'Authentication required',
            ]);
    }
}