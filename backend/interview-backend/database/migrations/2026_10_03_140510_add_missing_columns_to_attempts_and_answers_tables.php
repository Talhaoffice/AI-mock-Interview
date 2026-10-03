
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('attempts', 'candidate_name')) {
                $table->string('candidate_name')
                    ->nullable()
                    ->default('Candidate');
            }

            if (!Schema::hasColumn('attempts', 'total_questions')) {
                $table->integer('total_questions')->default(0);
            }
        });

        Schema::table('answers', function (Blueprint $table) {
            if (!Schema::hasColumn('answers', 'user_role')) {
                $table->string('user_role')
                    ->nullable()
                    ->default('user');
            }
        });
    }

    public function down(): void
    {
        Schema::table('answers', function (Blueprint $table) {
            if (Schema::hasColumn('answers', 'user_role')) {
                $table->dropColumn('user_role');
            }
        });

        Schema::table('attempts', function (Blueprint $table) {
            if (Schema::hasColumn('attempts', 'candidate_name')) {
                $table->dropColumn('candidate_name');
            }

            if (Schema::hasColumn('attempts', 'total_questions')) {
                $table->dropColumn('total_questions');
            }
        });
    }
};