<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Identity proof (diploma/TOR) uploaded once per alumni user, not tied
// to any single request. Kept separate from request_documents because
// it's about who the user IS, not what a specific request needs.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('alumni_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->enum('document_type', ['diploma', 'tor']);
            $table->string('path');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumni_verifications');
    }
};