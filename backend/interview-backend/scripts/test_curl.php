<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

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

$payload = json_encode([
    'contents' => [[
        'parts' => [[
            'text' => $prompt
        ]]
    ]],
    'generationConfig' => [
        'temperature' => $temperature,
    ]
]);

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$geminiKey}";

echo "Testing with direct cURL (60s timeout)..." . PHP_EOL;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($payload)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode" . PHP_EOL;
if ($curlError) {
    echo "cURL Error: $curlError" . PHP_EOL;
}
if ($response) {
    echo "Response: $response" . PHP_EOL;
}