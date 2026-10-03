<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\AdminController;

Route::get('/test', function () {
    return response()->json([
        'status' => 'online',
        'message' => 'AI Mock Interview API is running smoothly'
    ]);
});

// Questions API
Route::get('/questions', [QuestionController::class, 'index']);
Route::post('/questions', [QuestionController::class, 'store']);
Route::put('/questions/{id}', [QuestionController::class, 'update']);
Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);

// Admin Specific Endpoints
Route::post('/admin/add-question', [AdminController::class, 'addQuestion']);

// Interview Execution & Scoring Endpoints
Route::post('/start-attempt', [AnswerController::class, 'startAttempt']);
Route::post('/submit-answer', [AnswerController::class, 'submit']);
Route::post('/save-attempt', [AnswerController::class, 'saveAttempt']);
Route::get('/results', [AnswerController::class, 'result']);

// Resume Parsing
Route::post('/upload-resume', [ResumeController::class, 'upload']);