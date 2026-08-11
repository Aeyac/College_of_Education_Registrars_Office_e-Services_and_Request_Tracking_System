<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('request_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            // requirement: student-submitted requirement file
            // verification: internal check/verification artifact
            // output: the final generated certificate/document
            $table->enum('type', ['requirement', 'verification', 'output']);
            $table->string('path');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_documents');
    }
};