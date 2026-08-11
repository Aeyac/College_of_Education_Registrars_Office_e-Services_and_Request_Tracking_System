<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Source of truth for the compliance loop and the client's accountability
// requirement (revision letter item 21): who reviewed/updated/approved/
// returned/released each request, and when.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('request_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('from_status_id')->nullable()->constrained('request_statuses');
            $table->foreignId('to_status_id')->constrained('request_statuses');
            $table->foreignId('changed_by')->constrained('users');
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['request_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_status_history');
    }
};