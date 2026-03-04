<?php

namespace App\Notifications\Channels;

use GuzzleHttp\Client as GuzzleClient;
use Illuminate\Notifications\Notification;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;

class FcmChannel
{
    /**
     * Send the given notification.
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toFcm')) {
            return;
        }

        $tokens = (array) $notifiable->routeNotificationForFcm();
        \Log::debug("FCM: Found " . count($tokens) . " tokens for user {$notifiable->id}");
        
        if (empty($tokens)) {
            return;
        }

        $fcmData = $notification->toFcm($notifiable);
        $accessToken = $this->getAccessToken();

        if (!$accessToken) {
            logger()->error('Failed to generate FCM Access Token.');
            return;
        }

        $projectId = config('services.fcm.project_id', 'siperkasaapp');
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        foreach ($tokens as $token) {
            $this->sendToToken($url, $accessToken, $token, $fcmData);
        }
    }

    /**
     * Get OAuth2 access token from Google Service Account.
     */
    protected function getAccessToken()
    {
        $path = base_path(config('services.fcm.credentials'));
        
        if (!file_exists($path)) {
            logger()->warning("Firebase credentials file not found at: {$path}");
            return null;
        }

        $credentials = new ServiceAccountCredentials(
            'https://www.googleapis.com/auth/cloud-platform',
            $path
        );

        $token = $credentials->fetchAuthToken();

        return $token['access_token'] ?? null;
    }

    /**
     * Send message to a specific token via HTTP v1.
     */
    protected function sendToToken($url, $accessToken, $token, $data)
    {
        $payload = [
            'message' => [
                'token' => $token,
                'notification' => [
                    'title' => $data['notification']['title'] ?? '',
                    'body' => $data['notification']['body'] ?? '',
                ],
                // Add webpush specific config for better browser support
                'webpush' => [
                    'fcm_options' => [
                        'link' => $data['data']['url'] ?? $data['data']['ticket_url'] ?? '/dashboard'
                    ]
                ],
                'data' => array_map('strval', $data['data'] ?? []),
            ]
        ];

        try {
            $response = Http::withToken($accessToken)
                ->post($url, $payload);
            
            if ($response->failed()) {
                \Log::error("FCM Send Failed for token " . substr($token, 0, 10) . "... : " . $response->body());
            } else {
                \Log::debug("FCM Send Success for token " . substr($token, 0, 10) . "...");
            }
        } catch (\Exception $e) {
            \Log::error("FCM Send Error: " . $e->getMessage());
        }
    }
}
