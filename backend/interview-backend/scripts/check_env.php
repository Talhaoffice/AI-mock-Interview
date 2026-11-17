<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
echo 'GEMINI_API_KEY=' . (env('GEMINI_API_KEY') ?? 'NOT SET') . PHP_EOL;
echo 'GEMINI_TEMPERATURE=' . (env('GEMINI_TEMPERATURE') ?? 'NOT SET') . PHP_EOL;