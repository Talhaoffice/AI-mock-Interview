#!/usr/bin/env php
<?php

/**
 * Batch Evaluation Script for AI Mock Interview
 * 
 * Compares Gemini vs Heuristic scoring on a set of interview answers.
 * 
 * Usage:
 *   php scripts/batch_evaluate.php --input=sample_input.csv --output=results.csv
 * 
 * Input CSV columns: answer_id,question,skill,answer_text
 * Output CSV columns: answer_id,question,skill,answer_text,gemini_score,gemini_feedback,gemini_fallback_used,heuristic_score,heuristic_feedback
 */

// Bootstrap Laravel
require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Parse command line arguments
$inputFile = null;
$outputFile = null;

foreach ($argv as $arg) {
    if (str_starts_with($arg, '--input=')) {
        $inputFile = substr($arg, 8);
    } elseif (str_starts_with($arg, '--output=')) {
        $outputFile = substr($arg, 9);
    }
}

if (!$inputFile || !$outputFile) {
    fwrite(STDERR, "Usage: php scripts/batch_evaluate.php --input=<input.csv> --output=<output.csv>\n");
    exit(1);
}

if (!file_exists($inputFile)) {
    fwrite(STDERR, "Error: Input file not found: {$inputFile}\n");
    exit(1);
}

// Resolve absolute paths
$inputFile = realpath($inputFile);
$outputFile = realpath(dirname($outputFile)) . '/' . basename($outputFile);

echo "Batch Evaluation Started\n";
echo "Input:  {$inputFile}\n";
echo "Output: {$outputFile}\n\n";

// Open input CSV
$inputHandle = fopen($inputFile, 'r');
if (!$inputHandle) {
    fwrite(STDERR, "Error: Could not open input file\n");
    exit(1);
}

// Read header
$header = fgetcsv($inputHandle);
if (!$header) {
    fwrite(STDERR, "Error: Empty input file\n");
    exit(1);
}

// Validate required columns
$requiredColumns = ['answer_id', 'question', 'skill', 'answer_text'];
$columnMap = [];
foreach ($requiredColumns as $col) {
    $idx = array_search($col, $header);
    if ($idx === false) {
        fwrite(STDERR, "Error: Required column '{$col}' not found in input CSV\n");
        fclose($inputHandle);
        exit(1);
    }
    $columnMap[$col] = $idx;
}

// Open output CSV
$outputHandle = fopen($outputFile, 'w');
if (!$outputHandle) {
    fwrite(STDERR, "Error: Could not create output file\n");
    fclose($inputHandle);
    exit(1);
}

// Write output header
$outputHeader = [
    'answer_id',
    'question',
    'skill',
    'answer_text',
    'gemini_score',
    'gemini_feedback',
    'gemini_fallback_used',
    'heuristic_score',
    'heuristic_feedback'
];
fputcsv($outputHandle, $outputHeader);

// Get the AnswerController instance (we'll use its private methods via reflection)
$controller = app()->make(\App\Http\Controllers\AnswerController::class);

// Use reflection to call private methods
$reflection = new ReflectionClass($controller);
$geminiMethod = $reflection->getMethod('scoreWithGemini');
$geminiMethod->setAccessible(true);
$heuristicMethod = $reflection->getMethod('scoreWithHeuristic');
$heuristicMethod->setAccessible(true);

$rowCount = 0;
$errorCount = 0;

while (($row = fgetcsv($inputHandle)) !== false) {
    $rowCount++;
    
    // Skip empty rows
    if (count($row) < 4 || trim($row[0]) === '') {
        continue;
    }

    $answerId = $row[$columnMap['answer_id']];
    $question = $row[$columnMap['question']];
    $skill = $row[$columnMap['skill']];
    $answerText = $row[$columnMap['answer_text']];

    echo "Processing row {$rowCount}: {$answerId} ({$skill})... ";

    try {
        // Score with Gemini
        $geminiResult = $geminiMethod->invoke($controller, $question, $skill, $answerText);
        $geminiScore = $geminiResult['score'];
        $geminiFeedback = $geminiResult['feedback'];
        $geminiFallbackUsed = $geminiResult['fallback_used'] ? 1 : 0;

        // Score with Heuristic
        $heuristicResult = $heuristicMethod->invoke($controller, $question, $skill, $answerText);
        $heuristicScore = $heuristicResult['score'];
        $heuristicFeedback = $heuristicResult['feedback'];

        // Write output row
        $outputRow = [
            $answerId,
            $question,
            $skill,
            $answerText,
            $geminiScore,
            $geminiFeedback,
            $geminiFallbackUsed,
            $heuristicScore,
            $heuristicFeedback
        ];
        fputcsv($outputHandle, $outputRow);

        echo "Done\n";
        echo "  Gemini:    score={$geminiScore}, fallback={$geminiFallbackUsed}\n";
        echo "  Heuristic: score={$heuristicScore}\n";
    } catch (\Exception $e) {
        $errorCount++;
        echo "ERROR: " . $e->getMessage() . "\n";
        
        // Write error row with zeros/empty
        $outputRow = [
            $answerId,
            $question,
            $skill,
            $answerText,
            0,
            "ERROR: " . $e->getMessage(),
            1,
            0,
            "ERROR: " . $e->getMessage()
        ];
        fputcsv($outputHandle, $outputRow);
    }
}

fclose($inputHandle);
fclose($outputHandle);

echo "\nBatch evaluation complete!\n";
echo "Rows processed: {$rowCount}\n";
echo "Errors: {$errorCount}\n";
echo "Output written to: {$outputFile}\n";