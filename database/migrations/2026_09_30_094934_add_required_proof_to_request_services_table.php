<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('request_services', function (Blueprint $table) {
            $table->boolean('requires_proof')->default(false)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('request_services', function (Blueprint $table) {
            $table->dropColumn('requires_proof');
        });
    }
};
