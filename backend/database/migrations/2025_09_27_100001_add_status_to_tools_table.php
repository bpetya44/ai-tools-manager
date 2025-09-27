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
        Schema::table('tools', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved')->after('is_active');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('status');
            $table->timestamp('approved_at')->nullable()->after('created_by');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null')->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropColumn(['status', 'created_by', 'approved_at', 'approved_by']);
        });
    }
};
