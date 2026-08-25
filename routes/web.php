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
        Route::get('/requests', [UserDashboardController::class, 'requests'])->name('requests');
        Route::post('/requests', [UserDashboardController::class, 'storeRequest'])->name('requests.store');
        Route::get('/faculty', [UserDashboardController::class, 'faculty'])->name('faculty');
        Route::get('/announcements', [UserDashboardController::class, 'announcements'])->name('announcements');
        Route::post('/verify-alumni', [UserDashboardController::class, 'storeAlumniProof'])->name('verify-alumni');
        Route::get('/documents', [UserDashboardController::class, 'documents'])->name('documents');
        Route::get('/faq', [UserDashboardController::class, 'faq'])->name('faq');
        Route::get('/about', [UserDashboardController::class, 'about'])->name('about');
        Route::get('/privacy-policy', [UserDashboardController::class, 'privacy'])->name('privacy');
        Route::get('/terms-of-service', [UserDashboardController::class, 'terms'])->name('terms');
        Route::post('/notifications/mark-as-read', [UserDashboardController::class, 'markNotificationsAsRead'])->name('notifications.read');
        
        // Inquiries Thread (User)
        Route::get('/inquiries', [UserDashboardController::class, 'inquiries'])->name('inquiries');
        Route::post('/inquiries', [UserDashboardController::class, 'storeInquiry'])->name('inquiries.store');
        Route::post('/inquiries/{id}/reply', [UserDashboardController::class, 'replyInquiry'])->name('inquiries.reply');
        Route::put('/inquiries/messages/{id}', [UserDashboardController::class, 'editMessage'])->name('inquiries.messages.edit');
        Route::delete('/inquiries/messages/{id}', [UserDashboardController::class, 'deleteMessage'])->name('inquiries.messages.destroy');
        
        // Inquiry Thread Actions (User)
        Route::put('/inquiries/{id}/read', [UserDashboardController::class, 'markInquiryRead'])->name('inquiries.read');
        Route::put('/inquiries/{id}/unread', [UserDashboardController::class, 'markInquiryUnread'])->name('inquiries.unread');
        Route::delete('/inquiries/{id}', [UserDashboardController::class, 'deleteInquiry'])->name('inquiries.destroy');
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
        Route::post('/notifications/mark-as-read', [AdminDashboardController::class, 'markNotificationsAsRead'])->name('notifications.read');
        Route::get('/export/excel', [AdminDashboardController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/pdf', [AdminDashboardController::class, 'exportPdf'])->name('export.pdf');

        // Inquiries Thread (Admin)
        Route::get('/inquiries', [AdminDashboardController::class, 'inquiries'])->name('inquiries');
        Route::post('/inquiries/{id}/reply', [AdminDashboardController::class, 'replyInquiry'])->name('inquiries.reply');
        Route::put('/inquiries/{id}/status', [AdminDashboardController::class, 'updateInquiryStatus'])->name('inquiries.status');
        Route::put('/inquiries/messages/{id}', [AdminDashboardController::class, 'editMessage'])->name('inquiries.messages.edit');
        Route::delete('/inquiries/messages/{id}', [AdminDashboardController::class, 'deleteMessage'])->name('inquiries.messages.destroy');
        
        // Inquiry Thread Actions (Admin)
        Route::put('/inquiries/{id}/read', [AdminDashboardController::class, 'markInquiryRead'])->name('inquiries.read');
        Route::put('/inquiries/{id}/unread', [AdminDashboardController::class, 'markInquiryUnread'])->name('inquiries.unread');
        Route::delete('/inquiries/{id}', [AdminDashboardController::class, 'deleteInquiry'])->name('inquiries.destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/chat/ask', [\App\Http\Controllers\ChatbotController::class, 'ask'])->name('chat.ask');
});

require __DIR__ . '/auth.php';