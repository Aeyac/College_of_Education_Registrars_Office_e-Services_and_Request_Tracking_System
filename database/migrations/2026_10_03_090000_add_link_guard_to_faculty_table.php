<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

// One `faculty` row is shared by the admin schedule record and the faculty
// account profile, so `user_id` is what stops the same schedule being uploaded
// twice. The unique index below is that guarantee, but a bare unique() would
// abort the migration on any pre-existing duplicate, so it is cleared first.
return new class extends Migration
{
    public function up(): void
    {
        $this->releaseDuplicateLinks();

        Schema::table('faculty', function (Blueprint $table) {
            $table->unique('user_id');
            $table->foreignId('last_edited_by')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $table->string('edited_by_role')->nullable()->after('last_edited_by');
        });
    }

    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->dropForeign(['last_edited_by']);
            $table->dropColumn(['last_edited_by', 'edited_by_role']);
        });

        // MariaDB treats a unique index as a valid parent index and rebinds the
        // user_id foreign key that an earlier migration created onto the unique
        // index added in up(). Dropping that index while the key still depends on
        // it fails with error 1553, so the key comes off first and goes straight
        // back on exactly as that migration declared it.
        Schema::table('faculty', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id']);
        });

        Schema::table('faculty', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Detach every faculty row that duplicates another row's user_id, keeping
     * the row that actually holds a schedule. Nothing is deleted: the rows left
     * behind simply become unlinked admin schedules again, which is the state
     * the linker and `faculty:link-schedules` already know how to resolve.
     */
    private function releaseDuplicateLinks(): void
    {
        $duplicates = DB::table('faculty')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('user_id');

        foreach ($duplicates as $userId) {
            $rows = DB::table('faculty')
                ->where('user_id', $userId)
                // Ascending, so a row that actually holds a schedule (0) sorts
                // ahead of an empty one (1) and is the row that keeps the link.
                // String comparison rather than JSON_LENGTH so the same migration
                // runs on SQLite, where the column is text there too.
                ->orderBy(DB::raw("CASE WHEN weekly_schedule IS NULL OR TRIM(weekly_schedule) = '' OR TRIM(weekly_schedule) IN ('[]', '{}', 'null') THEN 1 ELSE 0 END"))
                ->orderBy('id')
                ->get();

            $keep = $rows->shift();

            foreach ($rows as $row) {
                DB::table('faculty')->where('id', $row->id)->update(['user_id' => null]);
            }

            Log::warning('Released duplicate faculty.user_id links before adding the unique index.', [
                'user_id' => $userId,
                'kept_faculty_id' => $keep->id,
                'released_faculty_ids' => $rows->pluck('id')->all(),
            ]);
        }
    }
};
