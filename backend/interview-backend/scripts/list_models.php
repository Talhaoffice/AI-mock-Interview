<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

$geminiKey = env('GEMINI_API_KEY');

// List available models
echo "Listing available models..." . PHP_EOL;
try {
    $response = Http::withHeaders(['Content-Type' => 'application/json'])
        ->timeout(30)
        ->get("https://generativelanguage.googleapis.com/v1beta/models?key={$geminiKey}");
    
    echo "Status: " . $response->status() . PHP_EOL;
    $json = $response->json();
    if (isset($json['models'])) {
        foreach ($json['models'] as $model) {
            if (stripos($model['name'], 'gemini') !== false) {
                echo "  Model: {$model['name']} - Supported: " . implode(', ', $model['supportedGenerationMethods'] ?? []) . PHP_EOL;
            }
        }
    }
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . PHP_EOL;
}