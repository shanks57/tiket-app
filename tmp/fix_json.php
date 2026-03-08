<?php
$path = 'storage/app/firebase-auth.json';
$content = file_get_contents($path);
$newContent = str_replace('\\\\n', '\\n', $content);
file_put_contents($path, $newContent);
echo "Fixed!\n";
