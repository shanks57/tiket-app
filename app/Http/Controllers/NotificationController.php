<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Models\User;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()->orderBy('created_at', 'desc')->limit(20)->get()->map(function ($n) {
            return [
                'id' => $n->id,
                'type' => class_basename($n->type),
                'data' => $n->data,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at->toDateTimeString(),
            ];
        });

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications->each->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    public function sendTestNotification(Request $request)
    {
        $user = $request->user();
        
        // Ensure only admin can send test notifications
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'recipient_type' => 'required|in:all,technician,user',
        ]);

        $title = $request->input('title');
        $message = $request->input('message');
        $recipientType = $request->input('recipient_type');

        $query = User::query();

        if ($recipientType === 'technician') {
            $query->where('role', 'technician');
        } elseif ($recipientType === 'user') {
            $query->where('role', 'user');
        }

        $users = $query->get();
        
        if ($users->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada user yang ditemukan untuk kategori: ' . $recipientType
            ], 404);
        }

        // Use Notification facade to send to filtered users
        Notification::send($users, new TestNotification($title, $message));

        return response()->json([
            'status' => 'ok',
            'message' => 'Notifikasi dikirim ke ' . $users->count() . ' user (' . $recipientType . ').'
        ]);
    }
}
