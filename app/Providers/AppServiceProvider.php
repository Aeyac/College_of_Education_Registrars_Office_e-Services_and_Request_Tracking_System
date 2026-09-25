<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use App\Models\Course;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Auth\Notifications\ResetPassword; // Add this
use Illuminate\Notifications\Messages\MailMessage; // Add this

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        /* 
           ... Keep your existing Vite and Schema logic here ...
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
    }
}