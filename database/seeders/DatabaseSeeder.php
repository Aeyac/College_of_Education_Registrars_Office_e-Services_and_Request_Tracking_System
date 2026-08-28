<?php

namespace Database\Seeders;

use App\Models\FilteredWord;
use App\Models\RequestService;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'student']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'alumni']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);

        User::where('user_type', 'student')
            ->get()
            ->each(fn(User $user) => $user->assignRole('student'));

        User::where('user_type', 'alumni')
            ->get()
            ->each(fn(User $user) => $user->assignRole('alumni'));

        User::where('user_type', 'admin')
            ->get()
            ->each(fn(User $user) => $user->assignRole('admin'));

        RequestService::firstOrCreate(
            ['code' => 'internship_certificate'],
            ['label' => 'Internship Certificate', 'is_active' => true, 'sort_order' => 1]
        );
        RequestService::firstOrCreate(
            ['code' => 'copy_of_cobc'],
            ['label' => 'Copy of COBC', 'is_active' => true, 'sort_order' => 0]
        );

        $defaultWords = [
            'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy',
            'putangina', 'tangina', 'gago', 'bobo', 'tanga', 'inutil',
            'ulol', 'punyeta', 'hayop', 'gaga', 'kupal', 'tarantado',
        ];
 
        foreach ($defaultWords as $word) {
            FilteredWord::firstOrCreate(['word' => $word]);
        }
    }
}
