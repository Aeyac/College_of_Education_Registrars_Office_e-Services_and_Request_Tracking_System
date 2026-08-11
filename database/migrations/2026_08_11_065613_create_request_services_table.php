<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('request_services', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. internship_certificate, cobc_copy
            $table->string('label');          // e.g. "Internship / PT Certificate"
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_services');
    }
};