<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index()
    {
        return Question::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'question' => 'required',
            'skill' => 'required'
        ]);

        return Question::create($request->all());
    }

    public function destroy($id)
{
    $question = Question::find($id);

    if (!$question) {
        return response()->json(['message' => 'Not Found'], 404);
    }

    $question->delete();

    return response()->json(['message' => 'Deleted']);
}

public function update(Request $request, $id)
{
    $question = Question::find($id);

    if (!$question) {
        return response()->json(['message' => 'Not Found'], 404);
    }

    $question->update([
        'question' => $request->question,
        'skill' => $request->skill,
    ]);

    return response()->json([
        'message' => 'Updated Successfully',
        'data' => $question
    ]);
}
}