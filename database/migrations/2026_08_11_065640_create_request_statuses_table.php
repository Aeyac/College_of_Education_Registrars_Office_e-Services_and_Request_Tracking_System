<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('request_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // submitted, for_review, for_compliance, processing, ready_for_release, released, cancelled_returned
            $table->string('label');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_statuses');
    }
};