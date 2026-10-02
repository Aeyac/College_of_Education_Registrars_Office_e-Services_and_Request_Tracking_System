<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// An admin-created alumni account is verified on the spot without a proof
// document being uploaded, so these two columns have to allow nulls. Accounts
// that come through public registration still always write both values.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_verifications', function (Blueprint $table) {
            $table->enum('document_type', ['diploma', 'tor'])->nullable()->change();
            $table->string('path')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('alumni_verifications', function (Blueprint $table) {
            $table->enum('document_type', ['diploma', 'tor'])->nullable(false)->change();
            $table->string('path')->nullable(false)->change();
        });
    }
};
