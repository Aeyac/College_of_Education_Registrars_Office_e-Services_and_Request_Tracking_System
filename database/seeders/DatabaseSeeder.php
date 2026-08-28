<?php

namespace Database\Seeders;

use App\Models\FilteredWord;
use App\Models\RequestService;
use App\Models\RequestStatus;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'student']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'alumni']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);

        User::where('user_type', 'student')->get()->each(fn(User $user) => $user->assignRole('student'));
        User::where('user_type', 'alumni')->get()->each(fn(User $user) => $user->assignRole('alumni'));
        User::where('user_type', 'admin')->get()->each(fn(User $user) => $user->assignRole('admin'));

        // 1. Updated Service Catalog
        RequestService::firstOrCreate(['code' => 'internship_certificate'], ['label' => 'Internship Certificate / PT Certificate', 'is_active' => true, 'sort_order' => 1]);
        RequestService::firstOrCreate(['code' => 'copy_of_cobc'], ['label' => 'Request for Copy of COBC', 'is_active' => true, 'sort_order' => 2]);
        RequestService::firstOrCreate(['code' => 'course_description'], ['label' => 'Course Description', 'is_active' => true, 'sort_order' => 3]);
        RequestService::firstOrCreate(['code' => 'golden_grain'], ['label' => 'Golden Grain (Yearbook)', 'is_active' => true, 'sort_order' => 4]);
        RequestService::firstOrCreate(['code' => 'alumni_certificate'], ['label' => 'Alumni Certificate Request', 'is_active' => true, 'sort_order' => 5]);

        // 2. REQUIRED: Request Statuses (Fixes the 404 Error)
        $statuses = [
            ['code' => 'submitted', 'label' => 'Submitted', 'sort_order' => 1],
            ['code' => 'for_review', 'label' => 'For Review', 'sort_order' => 2],
            ['code' => 'processing', 'label' => 'Processing', 'sort_order' => 3],
            ['code' => 'ready_for_release', 'label' => 'Ready for Release', 'sort_order' => 4],
            ['code' => 'released', 'label' => 'Released', 'sort_order' => 5],
            ['code' => 'for_compliance', 'label' => 'For Compliance', 'sort_order' => 6],
            ['code' => 'cancelled_returned', 'label' => 'Cancelled / Returned', 'sort_order' => 7],
        ];

        foreach ($statuses as $status) {
            RequestStatus::firstOrCreate(['code' => $status['code']], $status);
        }

        // 3. Profanity Filter Words
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