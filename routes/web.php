<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // === USER / STUDENT ROUTES ===
    Route::prefix('user')->name('user.')->middleware('role:student|alumni')->group(function () {
        Route::get('/dashboard', [UserDashboardController::class, 'dashboard'])->name('dashboard');

        // Document Requests
        Route::get('/requests', [UserDashboardController::class, 'requests'])->name('requests');
        Route::post('/requests', [UserDashboardController::class, 'storeRequest'])->name('requests.store');

        // Faculty Schedules (Read-Only)
        Route::get('/faculty', [UserDashboardController::class, 'faculty'])->name('faculty');

        // Announcements
        Route::get('/announcements', [UserDashboardController::class, 'announcements'])->name('announcements');

        // Alumni Verification Proof
        Route::post('/verify-alumni', [UserDashboardController::class, 'storeAlumniProof'])->name('verify-alumni');

        // Additional Modules
        Route::get('/documents', [UserDashboardController::class, 'documents'])->name('documents');
        Route::get('/faq', [UserDashboardController::class, 'faq'])->name('faq');
        Route::get('/about', [UserDashboardController::class, 'about'])->name('about');
        Route::get('/privacy-policy', [UserDashboardController::class, 'privacy'])->name('privacy');
        Route::get('/terms-of-service', [UserDashboardController::class, 'terms'])->name('terms');

        // Notifications (User)
        Route::post('/notifications/mark-as-read', [UserDashboardController::class, 'markNotificationsAsRead'])->name('notifications.read');
    });

    // === ADMIN ROUTES ===
    Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])->name('dashboard');

        Route::get('/requests', [AdminDashboardController::class, 'requests'])->name('requests');
        Route::put('/requests/{id}', [AdminDashboardController::class, 'updateRequest'])->name('requests.update');

        Route::get('/alumni', [AdminDashboardController::class, 'alumni'])->name('alumni');
        Route::put('/alumni/{id}', [AdminDashboardController::class, 'updateAlumni'])->name('alumni.update');

        Route::get('/faculty', [AdminDashboardController::class, 'faculty'])->name('faculty');
        Route::post('/faculty', [AdminDashboardController::class, 'storeFaculty'])->name('faculty.store');
        Route::put('/faculty/{id}', [AdminDashboardController::class, 'updateFaculty'])->name('faculty.update');
        Route::delete('/faculty/{id}', [AdminDashboardController::class, 'destroyFaculty'])->name('faculty.destroy');

        Route::get('/announcements', [AdminDashboardController::class, 'announcements'])->name('announcements');
        Route::post('/announcements', [AdminDashboardController::class, 'storeAnnouncement'])->name('announcements.store');
        Route::put('/announcements/{id}', [AdminDashboardController::class, 'updateAnnouncement'])->name('announcements.update');
        Route::delete('/announcements/{id}', [AdminDashboardController::class, 'destroyAnnouncement'])->name('announcements.destroy');

        Route::get('/users', [AdminDashboardController::class, 'users'])->name('users');
        Route::post('/users', [AdminDashboardController::class, 'storeUser'])->name('users.store');
        Route::put('/users/{id}', [AdminDashboardController::class, 'updateUser'])->name('users.update');
        Route::delete('/users/{id}', [AdminDashboardController::class, 'destroyUser'])->name('users.destroy');

        // Notifications (Admin)
        Route::post('/notifications/mark-as-read', [AdminDashboardController::class, 'markNotificationsAsRead'])->name('notifications.read');

        // Export (PDF and Excel)
        Route::get('/export/excel', [AdminDashboardController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/pdf', [AdminDashboardController::class, 'exportPdf'])->name('export.pdf');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';