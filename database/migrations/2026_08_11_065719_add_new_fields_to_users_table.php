<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Extends Laravel's default `users` table rather than replacing it,
// so the built-in auth scaffolding keeps working as-is.
return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('user_type', ['student', 'alumni', 'admin'])->after('email');
            $table->string('student_number')->nullable()->after('user_type');
            $table->string('program')->nullable()->after('student_number');
            $table->string('year_level_or_batch')->nullable()->after('program');
            $table->string('contact_number')->nullable()->after('year_level_or_batch');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'user_type',
                'student_number',
                'program',
                'year_level_or_batch',
                'contact_number',
            ]);
            $table->dropSoftDeletes();
        });
    }
};