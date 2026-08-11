<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Only populated when requests.service_id = "Internship / PT Certificate".
// Kept out of `requests` so these columns aren't sparse/NULL for every
// other service type, and so they can be NOT NULL here.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('internship_request_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->unique()->constrained('requests')->cascadeOnDelete();
            $table->string('internship_school_or_agency');
            $table->string('grade_level_handled')->nullable();
            $table->string('semester');
            $table->string('school_year');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internship_request_details');
    }
};