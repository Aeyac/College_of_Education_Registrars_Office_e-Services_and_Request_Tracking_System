<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_add_archived_at_to_certificate_requests_table.php
    public function up()
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('status_id');
        });
    }

    public function down()
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
