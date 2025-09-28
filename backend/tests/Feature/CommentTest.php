<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\ToolsTool;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private ToolsTool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a role
        $role = Role::create([
            'name' => 'User',
            'slug' => 'user',
            'description' => 'Regular user role'
        ]);

        // Create a user
        $this->user = User::factory()->create(['role_id' => $role->id]);

        // Create a tool
        $this->tool = ToolsTool::factory()->create();
    }

    public function test_user_can_create_comment()
    {
        Sanctum::actingAs($this->user);

        $commentData = [
            'body' => 'This is a great tool!'
        ];

        $response = $this->postJson("/api/tools/{$this->tool->id}/comments", $commentData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'body',
                    'user' => ['id', 'name'],
                    'created_at',
                    'updated_at'
                ]
            ]);

        $this->assertDatabaseHas('comments', [
            'tool_id' => $this->tool->id,
            'user_id' => $this->user->id,
            'body' => 'This is a great tool!'
        ]);
    }

    public function test_comment_validation_works()
    {
        Sanctum::actingAs($this->user);

        // Test empty body
        $response = $this->postJson("/api/tools/{$this->tool->id}/comments", [
            'body' => ''
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['body']);

        // Test body too long
        $response = $this->postJson("/api/tools/{$this->tool->id}/comments", [
            'body' => str_repeat('a', 1001)
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    }

    public function test_user_can_delete_own_comment()
    {
        Sanctum::actingAs($this->user);

        $comment = Comment::create([
            'tool_id' => $this->tool->id,
            'user_id' => $this->user->id,
            'body' => 'My comment'
        ]);

        $response = $this->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id
        ]);
    }

    public function test_user_cannot_delete_other_users_comment()
    {
        Sanctum::actingAs($this->user);

        $otherUser = User::factory()->create(['role_id' => $this->user->role_id]);
        $comment = Comment::create([
            'tool_id' => $this->tool->id,
            'user_id' => $otherUser->id,
            'body' => 'Other user comment'
        ]);

        $response = $this->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id
        ]);
    }

    public function test_admin_can_delete_any_comment()
    {
        // Create admin role and user
        $adminRole = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Admin role'
        ]);

        $admin = User::factory()->create(['role_id' => $adminRole->id]);
        Sanctum::actingAs($admin);

        $comment = Comment::create([
            'tool_id' => $this->tool->id,
            'user_id' => $this->user->id,
            'body' => 'User comment'
        ]);

        $response = $this->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id
        ]);
    }

    public function test_manager_can_delete_any_comment()
    {
        // Create manager role and user
        $managerRole = Role::create([
            'name' => 'Manager',
            'slug' => 'manager',
            'description' => 'Manager role'
        ]);

        $manager = User::factory()->create(['role_id' => $managerRole->id]);
        Sanctum::actingAs($manager);

        $comment = Comment::create([
            'tool_id' => $this->tool->id,
            'user_id' => $this->user->id,
            'body' => 'User comment'
        ]);

        $response = $this->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id
        ]);
    }
}
