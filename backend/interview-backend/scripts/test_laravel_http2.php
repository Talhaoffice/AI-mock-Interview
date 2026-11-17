<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

$geminiKey = env('GEMINI_API_KEY');
$temperature = (float) env('GEMINI_TEMPERATURE', 0);

$question = "Explain the concept of Virtual DOM in React and how reconciliation works.";
$skill = "React";
$answer = "The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new Virtual DOM tree and compares it with the previous one using a diffing algorithm called reconciliation.";

$prompt = "You are an expert technical interviewer. Evaluate this technical answer.\n"
    . "Question: {$question}\n"
    . "Domain Skill: {$skill}\n"
    . "Candidate Answer: {$answer}\n\n"
    . "Respond strictly in valid JSON format: {\"score\": <integer 1 to 10>, \"feedback\": \"<concise 2-sentence constructive feedback>\"}";

$payload = [
    'contents' => [[
        'parts' => [[
            'text' => $prompt
        ]]
    ]],
    'generationConfig' => [
        'temperature' => $temperature,
    ]
];

// Use the correct model name that exists in v1beta
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$geminiKey}";

echo "Testing Laravel HTTP client with CORRECT model name (gemini-2.5-flash)..." . PHP_EOL;
echo "URL: $url" . PHP_EOL;
echo PHP_EOL;

try {
    $response = Http::withHeaders(['Content-Type' => 'application/json'])
        ->timeout(60)
        ->post($url, $payload);

    echo "Status: " . $response->status() . PHP_EOL;
    echo "Successful: " . ($response->successful() ? 'yes' : 'no') . PHP_EOL;
    
    if (!$response->successful()) {
        echo "Error body: " . $response->body() . PHP_EOL;
    } else {
        $json = $response->json();
        echo "Response: " . json_encode($json, JSON_PRETTY_PRINT) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . PHP_EOL;
    echo "Trace: " . $e->getTraceAsString() . PHP_EOL;
}