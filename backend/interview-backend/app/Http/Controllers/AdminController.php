<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;

class AdminController extends Controller
{
    public function addQuestion(Request $request)
    {
        $request->validate([
            'question' => 'required',
            'skill' => 'required'
        ]);

        Question::create([
            'question' => $request->question,
            'skill' => $request->skill
        ]);

        return response()->json([
            'message' => 'Question added successfully'
        ]);
    }
}