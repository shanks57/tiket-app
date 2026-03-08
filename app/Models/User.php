<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nip',
        'username',
        'email',
        'password',
        'role',
        'unit',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // Override the username method for Fortify
    public function username()
    {
        return 'username';
    }

    // Relationships
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function assignedTickets()
    {
        return $this->belongsToMany(Ticket::class, 'ticket_user');
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class);
    }

    public function progressUpdates()
    {
        return $this->hasMany(TicketProgress::class, 'updated_by');
    }

    /*
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
    */

    public function attachments()
    {
        return $this->hasMany(TicketAttachment::class, 'uploaded_by');
    }

    public function categories()
    {
        return $this->belongsToMany(TicketCategory::class, 'technician_ticket_categories', 'user_id', 'category_id');
    }

    /**
     * Push subscription relationship
     */
    public function pushSubscriptions()
    {
        return $this->hasMany(\App\Models\PushSubscription::class);
    }

    public function mobileDevices()
    {
        return $this->hasMany(\App\Models\MobileDevice::class);
    }

    /**
     * Provide subscriptions to the webpush channel (laravel-notification-channels/webpush)
     */
    public function routeNotificationForWebPush()
    {
        return $this->pushSubscriptions()->get()->map(function ($sub) {
            return [
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
                'contentEncoding' => $sub->content_encoding,
            ];
        })->toArray();
    }

    /**
     * Return FCM device tokens for the 'fcm' channel
     */
    public function routeNotificationForFcm()
    {
        return $this->mobileDevices()->pluck('token')->toArray();
    }
}
