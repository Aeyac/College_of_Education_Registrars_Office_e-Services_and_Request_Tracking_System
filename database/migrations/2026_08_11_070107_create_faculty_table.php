<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Admin-maintained, read-only lookup for the "search faculty consultation
// hours" feature. No faculty portal, no relation to `requests`.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('faculty', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('department_or_program')->nullable();
            $table->string('consultation_days')->nullable();   // e.g. "Mon, Wed"
            $table->time('consultation_time_start')->nullable();
            $table->time('consultation_time_end')->nullable();
            $table->string('room_or_location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty');
    }
};