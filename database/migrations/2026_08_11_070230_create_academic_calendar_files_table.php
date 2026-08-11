<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('academic_calendar_files', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('file_path');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->string('effective_school_year');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_calendar_files');
    }
};