<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class TicketCreatedWebPush extends Notification
{
    use Queueable;

    protected $ticket;

    public function __construct($ticket)
    {
        $this->ticket = $ticket;
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
            ->title("Tiket baru: {$this->ticket->ticket_number}")
            ->icon('/assets/android/android-launchericon-192-192.png')
            ->body($this->ticket->title)
            ->data(['url' => route('admin.tickets.show', $this->ticket->id)]);
    }

    public function toFcm($notifiable)
    {
        $url = route('admin.tickets.show', $this->ticket->id);
        $title = "Tiket baru: {$this->ticket->ticket_number}";
        $body = $this->ticket->title;

        return [
            'notification' => [
                'title' => $title,
                'body' => $body,
            ],
            'android' => [
                'priority' => 'high',
                'notification' => [
                    'sound' => 'default',
                    'notification_priority' => 'PRIORITY_MAX',
                    'visibility' => 'PUBLIC',
                ],
            ],
            'apns' => [
                'payload' => [
                    'aps' => [
                        'alert' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                        'sound' => 'default',
                    ],
                ],
            ],
            'data' => [
                'ticket_id' => (string) $this->ticket->id,
                'type' => 'ticket.created',
                'url' => $url,
                'title' => $title,
                'body' => $body,
            ],
        ];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'ticket_created',
            'ticket_id' => $this->ticket->id,
            'title' => $this->ticket->title,
        ];
    }
}
