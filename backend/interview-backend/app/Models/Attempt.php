<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attempt extends Model
{
    protected $fillable = [
        'user_role',
        'candidate_name',
        'score',
        'total_questions',
    ];

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
