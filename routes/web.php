<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketCommentController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MobileDeviceController;
use App\Http\Controllers\PushSubscriptionController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    // Redirect authenticated users to dashboard
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    $data = [
        'canRegister' => Features::enabled(Features::registration()),
    ];

    return Inertia::render('welcome', $data);
})->name('home');

Route::middleware(['auth', 'verified', 'prevent-back-history'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Ticket routes for all authenticated users
    Route::get('tickets/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::post('tickets', [TicketController::class, 'store'])->name('tickets.store');

    // Comment routes (accessible by users and technicians)
    Route::middleware(['role:user|technician'])->group(function () {
        Route::post('tickets/{ticket}/comments', [TicketCommentController::class, 'store'])->name('tickets.comments.store');
    });

    // Web-push subscription endpoints (authenticated users)
    Route::post('/web-push/subscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'store'])->name('webpush.subscribe');
    Route::post('/web-push/unsubscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'destroy'])->name('webpush.unsubscribe');


    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // User routes
    Route::middleware(['role:user'])->prefix('user')->name('user.')->group(function () {
        Route::get('tickets', [TicketController::class, 'userTickets'])->name('tickets.index');
        Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    });

    // Technician routes
    Route::middleware(['role:technician'])->prefix('technician')->name('technician.')->group(function () {
        Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
        Route::put('tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
        Route::post('tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.update-status');
        Route::post('tickets/{ticket}/progress', [TicketController::class, 'addProgress'])->name('tickets.add-progress');
    });

    // Admin routes (accessible by both admins and technicians)
    Route::middleware(['role:admin|technician'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('tickets', TicketController::class)->except(['create', 'store']);
        Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');
        Route::post('tickets/{ticket}/claim', [TicketController::class, 'claim'])->name('tickets.claim');
        Route::post('tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.update-status');

        // Reports
        Route::get('reports/performance', [\App\Http\Controllers\ReportController::class, 'performanceReport'])->name('admin.reports.performance');
    });

    // Category routes (admin only)
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('categories', [CategoryController::class, 'indexCategories'])->name('categories.index');
        Route::get('categories/create', [CategoryController::class, 'createCategory'])->name('categories.create');
        Route::post('categories', [CategoryController::class, 'storeCategory'])->name('categories.store');
        Route::get('categories/{category}/edit', [CategoryController::class, 'editCategory'])->name('categories.edit');
        Route::put('categories/{category}', [CategoryController::class, 'updateCategory'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroyCategory'])->name('categories.destroy');
        Route::get('categories/{category}/technicians', [CategoryController::class, 'manageTechnicianCategories'])->name('categories.manage-technicians');
        Route::post('categories/{category}/assign-technicians', [CategoryController::class, 'assignTechniciansToCategory'])->name('categories.assign-technicians');

        // Subcategory routes
        Route::get('subcategories', [CategoryController::class, 'indexSubcategories'])->name('subcategories.index');
        Route::get('subcategories/create', [CategoryController::class, 'createSubcategory'])->name('subcategories.create');
        Route::post('subcategories', [CategoryController::class, 'storeSubcategory'])->name('subcategories.store');
        Route::get('subcategories/{subcategory}/edit', [CategoryController::class, 'editSubcategory'])->name('subcategories.edit');
        Route::put('subcategories/{subcategory}', [CategoryController::class, 'updateSubcategory'])->name('subcategories.update');
        Route::delete('subcategories/{subcategory}', [CategoryController::class, 'destroySubcategory'])->name('subcategories.destroy');
    });
});

require __DIR__ . '/settings.php';

// Mobile device registration for FCM (Moved outside verified group)
Route::middleware(['auth'])->group(function () {
    Route::post('/mobile/devices', [MobileDeviceController::class, 'store'])->name('mobile.devices.store');
    Route::post('/mobile/devices/unregister', [MobileDeviceController::class, 'destroy'])->name('mobile.devices.destroy');
    
    Route::get('/debug-auth', function() {
        return response()->json([
            'check' => Auth::check(),
            'user_id' => Auth::id(),
        ]);
    });
});
