<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Attempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnswerController extends Controller
{
    /**
     * Start a new interview attempt session
     */
    public function startAttempt(Request $request)
    {
        $attempt = Attempt::create([
            'user_role' => $request->input('user_role', 'user'),
            'candidate_name' => $request->input('candidate_name', 'Candidate'),
            'score' => 0,
            'total_questions' => $request->input('total_questions', 0),
        ]);

        return response()->json([
            'message' => 'Interview session started',
            'attempt_id' => $attempt->id,
            'attempt' => $attempt,
        ]);
    }

    /**
     * Submit and evaluate an answer
     */
    public function submit(Request $request)
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer' => 'required|string',
        ]);

        $question = Question::find($request->question_id);
        $userAnswer = trim($request->answer);
        $attemptId = $request->input('attempt_id');

        // Perform intelligent evaluation (AI or robust heuristic engine)
        $evaluation = $this->evaluateAnswer($question, $userAnswer);

        // Record Answer with score and constructive feedback
        $answerRecord = Answer::create([
            'question_id' => $question->id,
            'attempt_id' => $attemptId,
            'user_role' => $request->input('user_role', 'user'),
            'answer' => $userAnswer,
            'score' => $evaluation['score'],
            'feedback' => $evaluation['feedback'],
        ]);

        return response()->json([
            'message' => 'Answer submitted and evaluated successfully',
            'score' => $evaluation['score'],
            'feedback' => $evaluation['feedback'],
            'data' => $answerRecord,
        ]);
    }

    /**
     * Get interview results scoped to an attempt
     */
    public function result(Request $request)
    {
        $attemptId = $request->query('attempt_id');

        // If no attempt_id provided, look up the latest attempt
        if (!$attemptId) {
            $latestAttempt = Attempt::latest()->first();
            $attemptId = $latestAttempt ? $latestAttempt->id : null;
        }

        $query = Answer::join('questions', 'answers.question_id', '=', 'questions.id')
            ->select(
                'answers.id as answer_id',
                'answers.answer',
                'answers.score',
                'answers.feedback',
                'answers.attempt_id',
                'questions.id as question_id',
                'questions.question',
                'questions.skill'
            );

        if ($attemptId) {
            $query->where('answers.attempt_id', $attemptId);
        }

        $results = $query->get();

        // Skill-wise breakdown
        $skillBreakdown = [];
        $totalScore = 0;

        foreach ($results as $item) {
            $skill = $item->skill ?? 'General';
            if (!isset($skillBreakdown[$skill])) {
                $skillBreakdown[$skill] = [
                    'skill' => $skill,
                    'total_score' => 0,
                    'count' => 0,
                    'average' => 0,
                ];
            }
            $skillBreakdown[$skill]['total_score'] += $item->score;
            $skillBreakdown[$skill]['count'] += 1;
            $totalScore += $item->score;
        }

        foreach ($skillBreakdown as $skill => $data) {
            $skillBreakdown[$skill]['average'] = $data['count'] > 0
                ? round($data['total_score'] / $data['count'], 1)
                : 0;
        }

        return response()->json([
            'attempt_id' => $attemptId,
            'total_score' => $totalScore,
            'skill_breakdown' => array_values($skillBreakdown),
            'detailed_answers' => $results,
        ]);
    }

    /**
     * Save the final completed attempt
     */
    public function saveAttempt(Request $request)
    {
        $request->validate([
            'score' => 'required|numeric',
        ]);

        $attemptId = $request->input('attempt_id');
        $attempt = null;

        if ($attemptId) {
            $attempt = Attempt::find($attemptId);
            if ($attempt) {
                $attempt->update([
                    'score' => $request->score,
                    'total_questions' => $request->input('total_questions', $attempt->total_questions),
                ]);
            }
        }

        if (!$attempt) {
            $attempt = Attempt::create([
                'user_role' => $request->input('user_role', 'user'),
                'candidate_name' => $request->input('candidate_name', 'Candidate'),
                'score' => $request->score,
                'total_questions' => $request->input('total_questions', 0),
            ]);
        }

        return response()->json([
            'message' => 'Attempt saved successfully',
            'data' => $attempt,
        ]);
    }

    /**
     * Intelligent answer evaluator with AI support & heuristic NLP fallback
     */
    private function evaluateAnswer(Question $question, string $answer): array
    {
        $geminiKey = env('GEMINI_API_KEY');

        // 1. Try Gemini API if key is configured
        if (!empty($geminiKey)) {
            try {
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->timeout(8)
                    ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$geminiKey}", [
                        'contents' => [[
                            'parts' => [[
                                'text' => "You are an expert technical interviewer. Evaluate this technical answer.\n"
                                    . "Question: {$question->question}\n"
                                    . "Domain Skill: {$question->skill}\n"
                                    . "Candidate Answer: {$answer}\n\n"
                                    . "Respond strictly in valid JSON format: {\"score\": <integer 1 to 10>, \"feedback\": \"<concise 2-sentence constructive feedback>\"}"
                            ]]
                        ]]
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    // Extract JSON
                    if (preg_match('/\{[\s\S]*\}/', $text, $matches)) {
                        $parsed = json_decode($matches[0], true);
                        if (isset($parsed['score']) && isset($parsed['feedback'])) {
                            return [
                                'score' => max(1, min(10, (int)$parsed['score'])),
                                'feedback' => $parsed['feedback'],
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Gemini evaluation failed, falling back to heuristic: ' . $e->getMessage());
            }
        }

        // 2. Intelligent NLP Heuristic Evaluator (Offline & Instant)
        return $this->heuristicEvaluation($question, $answer);
    }

    /**
     * Domain-aware heuristic scoring & constructive feedback generator
     */
    private function heuristicEvaluation(Question $question, string $answer): array
    {
        $answer = trim($answer);
        $wordCount = str_word_count($answer);
        $skill = strtolower($question->skill ?? 'general');
        $qText = strtolower($question->question);
        $ansLower = strtolower($answer);

        // Technical dictionaries by skill
        $skillKeywords = [
            'react' => ['component', 'state', 'props', 'hook', 'useeffect', 'usestate', 'virtual dom', 'render', 'jsx', 'redux', 'context', 'lifecycle', 'memo', 'event'],
            'javascript' => ['function', 'closure', 'promise', 'async', 'await', 'scope', 'prototype', 'event loop', 'callback', 'variable', 'object', 'array', 'es6', 'dom'],
            'php' => ['variable', 'function', 'class', 'object', 'array', 'composer', 'namespace', 'trait', 'interface', 'pdo', 'session', 'cookie', 'exception'],
            'laravel' => ['artisan', 'eloquent', 'migration', 'controller', 'model', 'middleware', 'route', 'blade', 'service provider', 'request', 'orm', 'validation'],
            'sql' => ['select', 'table', 'database', 'query', 'join', 'primary key', 'foreign key', 'index', 'where', 'group by', 'insert', 'update', 'normalize'],
            'node' => ['express', 'npm', 'module', 'stream', 'buffer', 'event', 'async', 'callback', 'middleware', 'server', 'http', 'api', 'json'],
            'css' => ['flexbox', 'grid', 'responsive', 'media query', 'selector', 'box model', 'margin', 'padding', 'animation', 'transform'],
            'general' => ['system', 'data', 'structure', 'algorithm', 'performance', 'security', 'test', 'optimization', 'architecture', 'interface']
        ];

        // Find relevant keywords for this skill
        $domainWords = $skillKeywords[$skill] ?? $skillKeywords['general'];

        $matchedConcepts = [];
        foreach ($domainWords as $kw) {
            if (str_contains($ansLower, $kw)) {
                $matchedConcepts[] = $kw;
            }
        }

        // Base evaluation criteria
        $score = 0;
        $feedbackParts = [];

        // 1. Length & depth check
        if ($wordCount < 4) {
            $score = 2;
            $feedback = "Your answer is too brief. Provide a more detailed explanation with technical reasoning.";
            return ['score' => $score, 'feedback' => $feedback];
        } elseif ($wordCount >= 4 && $wordCount < 15) {
            $score += 4;
            $feedbackParts[] = "Good initial start, but elaborating with practical details will make your answer stronger.";
        } elseif ($wordCount >= 15 && $wordCount < 40) {
            $score += 6;
            $feedbackParts[] = "Clear and concise explanation.";
        } else {
            $score += 7;
            $feedbackParts[] = "Comprehensive and thorough response.";
        }

        // 2. Domain keyword and concept relevance
        $conceptMatches = count($matchedConcepts);
        if ($conceptMatches >= 3) {
            $score += 3;
            $feedbackParts[] = "Great use of key technical concepts: " . implode(', ', array_slice($matchedConcepts, 0, 3)) . ".";
        } elseif ($conceptMatches >= 1) {
            $score += 2;
            $feedbackParts[] = "Accurately touched upon " . implode(', ', $matchedConcepts) . ".";
        } else {
            $score += 1;
            $feedbackParts[] = "Try to incorporate more specific technical terminology related to {$question->skill}.";
        }

        // 3. Question context alignment
        $questionWords = array_filter(explode(' ', $qText), fn($w) => strlen($w) > 4);
        $relevantMatches = 0;
        foreach ($questionWords as $qw) {
            if (str_contains($ansLower, $qw)) {
                $relevantMatches++;
            }
        }
        if ($relevantMatches > 0) {
            $score += 1;
        }

        // Cap score between 1 and 10
        $finalScore = max(1, min(10, $score));

        return [
            'score' => $finalScore,
            'feedback' => implode(' ', $feedbackParts),
        ];
    }
}