<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->timestamp('archived_at_user')->nullable()->after('archived_at');
            $table->timestamp('archived_at_admin')->nullable()->after('archived_at_user');
        });

        // Backfill: preserve existing archived state for whichever side had it set.
        // Since you can't tell which side archived it historically, this copies
        // the old value to both — adjust if you'd rather it go to only one side.
        DB::table('requests')
            ->whereNotNull('archived_at')
            ->update([
                'archived_at_user' => DB::raw('archived_at'),
                'archived_at_admin' => DB::raw('archived_at'),
            ]);

        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }

    public function down()
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('status_id');
        });

        DB::table('requests')
            ->whereNotNull('archived_at_user')
            ->orWhereNotNull('archived_at_admin')
            ->update([
                'archived_at' => DB::raw('COALESCE(archived_at_user, archived_at_admin)'),
            ]);

        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['archived_at_user', 'archived_at_admin']);
        });
    }
};