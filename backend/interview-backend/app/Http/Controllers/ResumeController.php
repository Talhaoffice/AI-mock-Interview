<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;

class ResumeController extends Controller
{
    /**
     * Upload and parse resume to extract technical skills and recommend interview questions
     */
    public function upload(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|max:5120', // Max 5MB
        ]);

        $file = $request->file('resume');
        $path = $file->getRealPath();
        $extension = strtolower($file->getClientOriginalExtension());

        $text = '';

        if ($extension === 'txt') {
            $text = file_get_contents($path);
        } elseif ($extension === 'pdf') {
            $text = $this->extractTextFromPdf($path);
        } else {
            // Fallback for doc or generic files
            $text = @file_get_contents($path) ?: '';
        }

        $textLower = strtolower($text);

        // Predefined technical skill dictionary with boundary-aware patterns
        $skillDictionary = [
            'react' => ['react', 'reactjs', 'react.js'],
            'javascript' => ['javascript', 'js', 'es6', 'typescript'],
            'php' => ['php', 'php8', 'php7'],
            'laravel' => ['laravel', 'eloquent', 'artisan', 'blade'],
            'sql' => ['sql', 'mysql', 'postgresql', 'sqlite', 'database', 'queries'],
            'node' => ['node', 'nodejs', 'node.js', 'express', 'expressjs'],
            'html' => ['html', 'html5'],
            'css' => ['css', 'css3', 'tailwind', 'bootstrap', 'sass'],
            'python' => ['python', 'django', 'flask', 'fastapi'],
            'git' => ['git', 'github', 'gitlab', 'version control'],
            'docker' => ['docker', 'container', 'kubernetes'],
            'api' => ['rest', 'restful', 'graphql', 'api', 'microservices'],
        ];

        $foundSkills = [];
        foreach ($skillDictionary as $skillName => $patterns) {
            foreach ($patterns as $pattern) {
                // Word boundary matching to avoid false positives (e.g., 'php' inside 'typhoon')
                if (preg_match('/\b' . preg_quote($pattern, '/') . '\b/i', $textLower)) {
                    $foundSkills[] = ucfirst($skillName);
                    break;
                }
            }
        }

        $foundSkills = array_values(array_unique($foundSkills));

        // Find available interview questions matching the candidate's skills
        $recommendedQuestions = [];
        if (!empty($foundSkills)) {
            $recommendedQuestions = Question::whereIn('skill', array_map('strtolower', $foundSkills))
                ->orWhereIn('skill', $foundSkills)
                ->limit(10)
                ->get();
        }

        return response()->json([
            'message' => 'Resume analyzed successfully',
            'filename' => $file->getClientOriginalName(),
            'skills_found' => $foundSkills,
            'skills_count' => count($foundSkills),
            'recommended_questions' => $recommendedQuestions,
        ]);
    }

    /**
     * Basic printable stream extractor for PDF files
     */
    private function extractTextFromPdf(string $filePath): string
    {
        $content = @file_get_contents($filePath);
        if (!$content) {
            return '';
        }

        // Extract text between BT (Begin Text) and ET (End Text) markers in uncompressed PDFs
        if (preg_match_all('/BT[\s\S]*?ET/', $content, $matches)) {
            $extracted = implode(' ', $matches[0]);
            // Remove PDF commands
            $clean = preg_replace('/[\\\\\/\[\]\(\)\<\>]/', ' ', $extracted);
            return $clean;
        }

        // Fallback: extract continuous printable ASCII/UTF-8 character sequences
        preg_match_all('/[a-zA-Z0-9_\-\.\,\s]{3,}/', $content, $printable);
        return implode(' ', $printable[0] ?? []);
    }
}