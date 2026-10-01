<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::find(11);
if($user) { 
    $data = ['user_type' => 'faculty'];
    $user->update($data);

    if ($data['user_type'] === 'faculty' && !$user->facultyProfile) {
        $user->facultyProfile()->create([
            'department_or_program' => 'Not specified',
            'room_or_location' => 'Not specified',
            'weekly_schedule' => [],
        ]);
    }

    $role = Spatie\Permission\Models\Role::firstOrCreate(['name' => $data['user_type']]);
    $user->syncRoles([$role]);
    
    echo 'Success: Profile Created';
} else {
    echo 'User not found';
}
