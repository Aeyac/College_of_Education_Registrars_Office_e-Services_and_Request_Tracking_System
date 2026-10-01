<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Only courses that actually have majors get rows here (Secondary
// Education, Technology and Livelihood Education). A course with no
// matching majors rows simply has none — the frontend checks for that
// to decide whether to show a major dropdown at all.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('majors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('code'); // e.g. filipino, mathematics
            $table->string('label');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // A major's code only needs to be unique within its own course,
            // not globally — e.g. nothing stops two different courses from
            // both having a major coded "general" someday.
            $table->unique(['course_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('majors');
    }
};