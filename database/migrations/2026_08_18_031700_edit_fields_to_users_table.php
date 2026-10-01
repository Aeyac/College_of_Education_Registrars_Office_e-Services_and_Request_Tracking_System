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
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');

            $table->foreignId('course_id')->nullable()->after('year_level_or_batch')->constrained('courses');
            $table->foreignId('major_id')->nullable()->after('course_id')->constrained('majors');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['name', 'program']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('program')->nullable()->after('student_number');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('course_id');
            $table->dropConstrainedForeignId('major_id');
            $table->dropColumn(['first_name', 'last_name']);
        });
    }
};
