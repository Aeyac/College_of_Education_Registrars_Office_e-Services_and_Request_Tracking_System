<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\FilteredWord;
use App\Models\RequestService;
use App\Models\RequestStatus;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Role::firstOrCreate(['name' => 'student']);
        Role::firstOrCreate(['name' => 'alumni']);
        Role::firstOrCreate(['name' => 'admin']);

        User::where('user_type', 'student')->get()->each(fn (User $user) => $user->assignRole('student'));
        User::where('user_type', 'alumni')->get()->each(fn (User $user) => $user->assignRole('alumni'));
        User::where('user_type', 'admin')->get()->each(fn (User $user) => $user->assignRole('admin'));

        // 1. Updated Service Catalog
        RequestService::firstOrCreate(['code' => 'internship_certificate'], ['label' => 'Internship Certificate / PT Certificate', 'is_active' => true, 'sort_order' => 1]);
        RequestService::firstOrCreate(['code' => 'copy_of_cobc'], ['label' => 'Request for Copy of COBC', 'is_active' => true, 'sort_order' => 2]);
        RequestService::firstOrCreate(['code' => 'course_description'], ['label' => 'Course Description', 'is_active' => true, 'sort_order' => 3]);
        RequestService::firstOrCreate(['code' => 'golden_grain'], ['label' => 'Golden Grain (Yearbook)', 'is_active' => true, 'sort_order' => 4]);

        // 2. REQUIRED: Request Statuses (Fixes the 404 Error)
        $statuses = [
            ['code' => 'submitted', 'label' => 'Submitted', 'sort_order' => 1],
            ['code' => 'for_review', 'label' => 'For Review', 'sort_order' => 2],
            ['code' => 'processing', 'label' => 'Processing', 'sort_order' => 3],
            ['code' => 'ready_for_release', 'label' => 'Ready for Release', 'sort_order' => 4],
            ['code' => 'released', 'label' => 'Released', 'sort_order' => 5],
            ['code' => 'for_compliance', 'label' => 'For Compliance', 'sort_order' => 6],
            ['code' => 'cancelled', 'label' => 'Cancelled', 'sort_order' => 7],
            ['code' => 'rejected', 'label' => 'Rejected', 'sort_order' => 8],
        ];

        foreach ($statuses as $status) {
            RequestStatus::firstOrCreate(['code' => $status['code']], $status);
        }

        // 3. Profanity Filter Words
        $defaultWords = [
            'fuck',
            'shit',
            'bitch',
            'asshole',
            'dick',
            'pussy',
            'putangina',
            'tangina',
            'gago',
            'bobo',
            'tanga',
            'inutil',
            'ulol',
            'punyeta',
            'hayop',
            'gaga',
            'kupal',
            'tarantado',
        ];

        foreach ($defaultWords as $word) {
            FilteredWord::firstOrCreate(['word' => $word]);
        }

        $defaultFaqs = [
            [
                'question' => 'How do I request a document?',
                'answer' => "Navigate to the 'My Requests' tab and click '+ Submit New Request'. Select your document type, format, and provide a valid reason.",
                'sort_order' => 1,
            ],
            [
                'question' => 'How long does it take to process my request?',
                'answer' => 'Standard processing takes 3-5 working days. You can track the status in your dashboard.',
                'sort_order' => 2,
            ],
            [
                'question' => 'Where can I view the status of my request?',
                'answer' => "Your active requests are pinned to your Dashboard, and the full history is available under 'My Requests'.",
                'sort_order' => 3,
            ],
            [
                'question' => 'How do I upload my Alumni verification?',
                'answer' => "Click the 'Upload' button on the yellow banner in your Dashboard to submit your Diploma or TOR.",
                'sort_order' => 4,
            ],
            [
                'question' => 'How can I schedule an appointment?',
                'answer' => "You can schedule an appointment by submitting an inquiry. Go to 'My Inquiries', start a new thread, and provide your preferred date, time, and purpose.",
                'sort_order' => 5,
            ],
            [
                'question' => 'Can I update my profile picture and details?',
                'answer' => "Yes, you can navigate to 'Profile Settings' from the sidebar to update your email, password, profile picture, and contact information.",
                'sort_order' => 6,
            ],
        ];

        foreach ($defaultFaqs as $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                [
                    'answer' => $faq['answer'],
                    'sort_order' => $faq['sort_order'],
                ],
            );
        }
    }
}
