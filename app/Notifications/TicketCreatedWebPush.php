<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class TicketCreatedWebPush extends Notification implements ShouldQueue
{
    use Queueable;

    protected $ticket;

    public function __construct($ticket)
    {
        $this->ticket = $ticket;
    }

    public function via($notifiable)
    {
        return ['database', 'webpush', \App\Notifications\Channels\FcmChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title("Tiket baru: {$this->ticket->ticket_number}")
            ->icon('/assets/android/android-launchericon-192-192.png')
            ->body($this->ticket->title)
            ->action('view', 'Lihat')
            ->data(['url' => route('tickets.show', $this->ticket->id)]);
    }

    public function toFcm($notifiable)
    {
        return [
            'notification' => [
                'title' => "Tiket baru: {$this->ticket->ticket_number}",
                'body' => $this->ticket->title,
                'sound' => 'default',
            ],
            'data' => [
                'ticket_id' => (string) $this->ticket->id,
                'type' => 'ticket.created',
                'url' => $notifiable->role === 'user' 
                    ? route('user.tickets.show', $this->ticket->id) 
                    : route('admin.tickets.show', $this->ticket->id),
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
