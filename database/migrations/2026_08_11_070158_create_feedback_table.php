<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Purely one-way: student/alumni submits, registrar reads via dashboard.
// No response/reply column or workflow by design.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->nullable()->constrained('requests')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->unsignedTinyInteger('rating')->nullable(); // e.g. 1-5, optional
            $table->text('comments')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};