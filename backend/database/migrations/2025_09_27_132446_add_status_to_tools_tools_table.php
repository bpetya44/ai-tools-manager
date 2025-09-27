<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tools_tools', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('description');
            $table->timestamp('approved_at')->nullable()->after('status');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null')->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools_tools', function (Blueprint $table) {
            $table->dropColumn(['status', 'approved_at', 'approved_by']);
        });
    }
};