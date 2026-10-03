<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;

class QuestionSeeder extends Seeder
{
    /**
     * Seed initial technical interview questions.
     */
    public function run(): void
    {
        $questions = [
            [
                'question' => 'Explain the concept of Virtual DOM in React and how reconciliation works.',
                'skill' => 'React',
            ],
            [
                'question' => 'What are React Hooks? Compare useState and useEffect with class component lifecycles.',
                'skill' => 'React',
            ],
            [
                'question' => 'How does the JavaScript Event Loop handle asynchronous operations, microtasks, and macrotasks?',
                'skill' => 'JavaScript',
            ],
            [
                'question' => 'What is a Closure in JavaScript, and what are practical use cases for it?',
                'skill' => 'JavaScript',
            ],
            [
                'question' => 'What is Eloquent ORM in Laravel, and how do you prevent the N+1 query problem using eager loading?',
                'skill' => 'Laravel',
            ],
            [
                'question' => 'Explain Laravel Middleware and how request filtering is structured in the pipeline.',
                'skill' => 'Laravel',
            ],
            [
                'question' => 'What is Database Normalization (1NF, 2NF, 3NF), and when would you intentionally denormalize?',
                'skill' => 'SQL',
            ],
            [
                'question' => 'How do database indexes improve query performance, and what are their trade-offs?',
                'skill' => 'SQL',
            ],
            [
                'question' => 'What are the main differences between sessions and cookies in PHP web development?',
                'skill' => 'PHP',
            ],
            [
                'question' => 'Explain RESTful API principles and best practices for HTTP status codes.',
                'skill' => 'API',
            ],
        ];

        foreach ($questions as $q) {
            Question::firstOrCreate(
                ['question' => $q['question']],
                ['skill' => $q['skill']]
            );
        }
    }
}
