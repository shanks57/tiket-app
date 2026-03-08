<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class TestNotification extends Notification
{
    use Queueable;

    protected $title;
    protected $message;

    public function __construct($title = "Test Notification", $message = "Ini adalah sebuah pesan percobaan.")
    {
        $this->title = $title;
        $this->message = $message;
    }

    public function via($notifiable)
    {
        $channels = ['database', \App\Notifications\Channels\FcmChannel::class];
        
        if (class_exists(\NotificationChannels\WebPush\WebPushChannel::class)) {
            $channels[] = 'webpush';
        }
        
        return $channels;
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title($this->title)
            ->body($this->message)
            ->icon('/assets/android/android-launchericon-192-192.png')
            ->data(['url' => route('dashboard')]);
    }

    public function toFcm($notifiable)
    {
        return [
            'notification' => [
                'title' => $this->title,
                'body' => $this->message,
            ],
            'android' => [
                'priority' => 'high',
                'notification' => [
                    'sound' => 'default',
                    'notification_priority' => 'PRIORITY_MAX',
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK', // For hybrid apps, but often triggers system bar
                    'visibility' => 'PUBLIC',
                ],
            ],
            'apns' => [
                'payload' => [
                    'aps' => [
                        'alert' => [
                            'title' => $this->title,
                            'body' => $this->message,
                        ],
                        'sound' => 'default',
                    ],
                ],
            ],
            'data' => [
                'type' => 'test.notification',
                'url' => route('dashboard'),
                'title' => $this->title,
                'body' => $this->message,
            ],
        ];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'test_notification',
            'title' => $this->title,
            'message' => $this->message,
        ];
    }
}
