<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$u = App\Models\User::find(11);
if($u) { 
    $u->user_type = 'faculty';
    $u->course_id = null;
    $u->major_id = null;
    $u->batch_year = null;
    $u->year_level = null;
    $u->save();
    echo 'Success: ' . $u->user_type;
} else {
    echo 'User 11 not found';
}
