<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['question', 'skill', 'difficulty', 'sample_answer'];

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
