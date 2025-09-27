<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TwoFactorCode extends Model
{
    protected $fillable = [
        'user_id',
        'code_hash',
        'expires_at',
        'type',
        'used',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the code.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate and store a new 2FA code.
     */
    public static function generate(User $user, string $type = 'email'): self
    {
        // Clean up old codes for this user and type
        self::where('user_id', $user->id)
            ->where('type', $type)
            ->delete();

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Hash the code
        $codeHash = Hash::make($code);

        // Store with 10-minute expiry
        return self::create([
            'user_id' => $user->id,
            'code_hash' => $codeHash,
            'expires_at' => now()->addMinutes(10),
            'type' => $type,
        ]);
    }

    /**
     * Verify a code.
     */
    public static function verify(User $user, string $code, string $type = 'email'): bool
    {
        $codeRecord = self::where('user_id', $user->id)
            ->where('type', $type)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$codeRecord) {
            return false;
        }

        if (Hash::check($code, $codeRecord->code_hash)) {
            $codeRecord->update(['used' => true]);
            return true;
        }

        return false;
    }

    /**
     * Check if user has a valid unused code.
     */
    public static function hasValidCode(User $user, string $type = 'email'): bool
    {
        return self::where('user_id', $user->id)
            ->where('type', $type)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->exists();
    }

    /**
     * Get the plain text code for logging (dev only).
     */
    public static function getCodeForLogging(User $user, string $type = 'email'): ?string
    {
        // This is only for development logging - in production, codes should never be stored in plain text
        if (app()->environment('local', 'testing')) {
            // In dev, we'll generate a predictable code for logging purposes
            return str_pad($user->id % 1000000, 6, '0', STR_PAD_LEFT);
        }

        return null;
    }
}
