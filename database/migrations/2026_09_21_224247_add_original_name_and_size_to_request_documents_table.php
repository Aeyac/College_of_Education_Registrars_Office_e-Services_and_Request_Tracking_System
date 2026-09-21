<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('request_documents', function (Blueprint $table) {
            $table->string('original_name')->nullable()->after('path');
            $table->unsignedInteger('size')->nullable()->after('original_name'); // bytes
        });
    }

    public function down(): void
    {
        Schema::table('request_documents', function (Blueprint $table) {
            $table->dropColumn(['original_name', 'size']);
        });
    }
};
