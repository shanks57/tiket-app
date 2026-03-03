<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Web Push Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the Laravel WebPush notification channel.
    | VAPID keys are required for authenticating push notifications.
    |
    */

    'public_key' => env('VAPID_PUBLIC_KEY'),
    'private_key' => env('VAPID_PRIVATE_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Push Notification Options
    |--------------------------------------------------------------------------
    */

    'web_push' => [
        'ttl' => 86400, // Time to live in seconds (24 hours)
        'urgency' => 'normal', // normal, high, low
        'topic' => env('APP_NAME', 'SIPERKASA'),
    ],
];
