<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->dropColumn([
                'consultation_days',
                'consultation_time_start',
                'consultation_time_end',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->string('consultation_days')->nullable();
            $table->time('consultation_time_start')->nullable();
            $table->time('consultation_time_end')->nullable();
        });
    }
};