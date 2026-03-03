<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class TicketUpdatedWebPush extends Notification implements ShouldQueue
{
    use Queueable;

    protected $ticket;
    protected $summary;

    public function __construct($ticket, string $summary = '')
    {
        $this->ticket = $ticket;
        $this->summary = $summary;
    }

    public function via($notifiable)
    {
        // deliver to database, web-push (browser) and FCM (mobile app) when available
        return ['database', 'webpush', \App\Notifications\Channels\FcmChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title("Pembaruan tiket: {$this->ticket->ticket_number}")
            ->icon('/assets/android/android-launchericon-192-192.png')
            ->body($this->summary ?: $this->ticket->title)
            ->action('view', 'Lihat')
            ->data(['url' => route('tickets.show', $this->ticket->id)]);
    }

    /**
     * Mobile (FCM) payload
     */
    public function toFcm($notifiable)
    {
        return [
            'notification' => [
                'title' => "Tiket: {$this->ticket->ticket_number}",
                'body' => $this->summary ?: $this->ticket->title,
                'sound' => 'default',
            ],
            'data' => [
                'ticket_id' => (string) $this->ticket->id,
                'type' => 'ticket.updated',
                'url' => $notifiable->role === 'user' 
                    ? route('user.tickets.show', $this->ticket->id) 
                    : route('admin.tickets.show', $this->ticket->id),
            ],
        ];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'ticket_updated',
            'ticket_id' => $this->ticket->id,
            'summary' => $this->summary,
        ];
    }
}
