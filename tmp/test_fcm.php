<?php
require 'vendor/autoload.php';

use Google\Auth\Credentials\ServiceAccountCredentials;

$path = 'storage/app/firebase-auth.json';
if (!file_exists($path)) {
    die("File not found\n");
}

$json = json_decode(file_get_contents($path), true);
echo "Project ID: " . $json['project_id'] . "\n";

try {
    $credentials = new ServiceAccountCredentials(
        'https://www.googleapis.com/auth/cloud-platform',
        $path
    );

    $token = $credentials->fetchAuthToken();
    echo "Access Token: " . substr($token['access_token'], 0, 10) . "...\n";
    echo "Success!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
