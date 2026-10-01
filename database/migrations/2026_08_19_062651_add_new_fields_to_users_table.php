<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Students only: 1-4 (or 5 for irregular students). Nullable —
            // admins and alumni never have one.
            $table->unsignedTinyInteger('year_level')->nullable()->after('major_id');
            // alumni only
            $table->year('batch_year')->nullable()->after('year_level');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('year_level_or_batch');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('year_level_or_batch')->nullable()->after('major_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['year_level', 'batch_year']);
        });
    }
};