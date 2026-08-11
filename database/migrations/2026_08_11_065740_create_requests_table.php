<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('request_services');
            // Denormalized "current status" for fast dashboard reads.
            // Full transition history lives in request_status_history.
            $table->foreignId('status_id')->constrained('request_statuses');
            $table->enum('delivery_mode', ['soft_copy', 'hard_copy']);
            $table->text('purpose')->nullable();
            $table->date('preferred_claiming_date')->nullable();
            $table->timestamps();
            $table->softDeletes(); // registrar records must persist, never hard-delete

            $table->index(['status_id', 'created_at']);
            $table->index(['service_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};