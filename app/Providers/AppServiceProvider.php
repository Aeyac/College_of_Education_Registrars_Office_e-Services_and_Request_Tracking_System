<?php

namespace App\Providers;

use App\Services\ScheduleExtraction\GeminiScheduleExtractor;
use App\Services\ScheduleExtraction\ScheduleExtractorContract;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword; 
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
         $this->app->bind(ScheduleExtractorContract::class, function ($app) {
            return match (config('services.ai_extractor.provider', 'gemini')) {
                'gemini' => new GeminiScheduleExtractor(
                    apiKey: config('services.gemini.key'),
                    model: config('services.gemini.model'),
                    baseUrl: config('services.gemini.base_url'),
                ),
                default => throw new \RuntimeException('Unsupported AI extractor provider.'),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
        
        Vite::prefetch(concurrency: 3);
        
        // Force HTTPS only when deployed to the live server (production)
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        
        if (Schema::hasTable('courses')) {
            // 2. If the table is completely empty, run the seeder automatically
            if (Course::count() === 0) {
                Artisan::call('db:seed', [
                    '--class' => 'CourseAndMajorSeeder'
                ]);
            }
        }
            */
        // Override the default Reset Password Email Template
        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            // Generate the frontend URL for your React reset password page
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Reset Your Password - CED E-Services')
                ->view('emails.custom-reset-password', ['url' => $url]);
        });

         RateLimiter::for('schedule-extraction', function (Request $request) {
            return Limit::perMinute(6)->by($request->user()?->id ?: $request->ip());
        });
    }
}