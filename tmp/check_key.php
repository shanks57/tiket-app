<?php
$j = json_decode(file_get_contents('storage/app/firebase-auth.json'), true);
$key = $j['private_key'];
echo "Key Length: " . strlen($key) . "\n";
echo "First 30: " . substr($key, 0, 30) . "\n";
echo "Last 30: " . substr($key, -30) . "\n";
echo "Has actual newlines: " . (strpos($key, "\n") !== false ? "Yes" : "No") . "\n";
echo "Has literal backslash-n: " . (strpos($key, "\\n") !== false ? "Yes" : "No") . "\n";
