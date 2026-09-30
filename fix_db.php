<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = App\Models\User::where('user_type', 'faculty')->get();
$role = Spatie\Permission\Models\Role::firstOrCreate(['name' => 'faculty']);

foreach($users as $u) { 
    $u->syncRoles([$role]);
    if(!$u->facultyProfile) { 
        $u->facultyProfile()->create([
            'name' => trim($u->first_name . ' ' . $u->last_name),
            'department_or_program' => 'Not specified',
            'room_or_location' => 'Not specified',
            'weekly_schedule' => []
        ]); 
    } 
}
echo 'Fixed ' . $users->count() . ' users';
