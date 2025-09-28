<?php

namespace Tests\Feature;

use App\Models\Rating;
use App\Models\ToolsTool;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RatingTest extends TestCase
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

    public function test_user_can_create_rating()
    {
        Sanctum::actingAs($this->user);

        $ratingData = [
            'score' => 5
        ];

        $response = $this->postJson("/api/tools/{$this->tool->id}/rating", $ratingData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'score',
                    'tool_id',
                    'user_id',
                    'created_at',
                    'updated_at'
                ]
            ]);

        $this->assertDatabaseHas('ratings', [
            'tool_id' => $this->tool->id,
            'user_id' => $this->user->id,
            'score' => 5
        ]);
    }

    public function test_user_can_update_rating()
    {
        Sanctum::actingAs($this->user);

        // Create initial rating
        $rating = Rating::create([
            'tool_id' => $this->tool->id,
            'user_id' => $this->user->id,
            'score' => 3
        ]);

        // Update rating
        $response = $this->postJson("/api/tools/{$this->tool->id}/rating", [
            'score' => 5
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Rating updated successfully'
            ]);

        $this->assertDatabaseHas('ratings', [
            'id' => $rating->id,
            'tool_id' => $this->tool->id,
            'user_id' => $this->user->id,
            'score' => 5
        ]);

        // Should still be only one rating per user per tool
        $this->assertEquals(1, Rating::where('tool_id', $this->tool->id)
            ->where('user_id', $this->user->id)
            ->count());
    }

    public function test_rating_validation_works()
    {
        Sanctum::actingAs($this->user);

        // Test score too low
        $response = $this->postJson("/api/tools/{$this->tool->id}/rating", [
            'score' => 0
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['score']);

        // Test score too high
        $response = $this->postJson("/api/tools/{$this->tool->id}/rating", [
            'score' => 6
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['score']);

        // Test missing score
        $response = $this->postJson("/api/tools/{$this->tool->id}/rating", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['score']);
    }

    public function test_tool_average_rating_calculation()
    {
        // Create multiple users and ratings
        $role = Role::where('slug', 'user')->first();

        $user1 = User::factory()->create(['role_id' => $role->id]);
        $user2 = User::factory()->create(['role_id' => $role->id]);
        $user3 = User::factory()->create(['role_id' => $role->id]);

        // Create ratings
        Rating::create([
            'tool_id' => $this->tool->id,
            'user_id' => $user1->id,
            'score' => 5
        ]);

        Rating::create([
            'tool_id' => $this->tool->id,
            'user_id' => $user2->id,
            'score' => 3
        ]);

        Rating::create([
            'tool_id' => $this->tool->id,
            'user_id' => $user3->id,
            'score' => 4
        ]);

        // Refresh the tool to get updated averages
        $this->tool->refresh();
        $this->tool->loadAvg('ratings', 'score');
        $this->tool->loadCount('ratings');

        // Average should be (5 + 3 + 4) / 3 = 4.0
        $this->assertEquals(4.0, $this->tool->ratings_avg_score);
        $this->assertEquals(3, $this->tool->ratings_count);
    }

    public function test_unique_rating_per_user_per_tool()
    {
        Sanctum::actingAs($this->user);

        // Create first rating
        $response1 = $this->postJson("/api/tools/{$this->tool->id}/rating", [
            'score' => 3
        ]);

        $response1->assertStatus(201);

        // Try to create another rating for same user and tool
        $response2 = $this->postJson("/api/tools/{$this->tool->id}/rating", [
            'score' => 5
        ]);

        $response2->assertStatus(200); // Should update, not create new

        // Should still be only one rating
        $this->assertEquals(1, Rating::where('tool_id', $this->tool->id)
            ->where('user_id', $this->user->id)
            ->count());
    }
}
