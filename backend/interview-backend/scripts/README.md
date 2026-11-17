# Batch Evaluation Scripts

This directory contains tools for comparing the two scoring paths in the AI Mock Interview platform:
1. **Gemini 1.5 Flash** (when `GEMINI_API_KEY` is configured)
2. **Offline Heuristic Fallback** (always available)

## Files

| File | Description |
|------|-------------|
| `batch_evaluate.php` | Main CLI script to run batch evaluation |
| `sample_input.csv` | Example input with 3 technical interview answers |
| `README.md` | This file |

## Usage

```bash
# From the backend/interview-backend directory
php scripts/batch_evaluate.php --input=scripts/sample_input.csv --output=scripts/results.csv
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--input=<path>` | Yes | Path to input CSV file |
| `--output=<path>` | Yes | Path to output CSV file |

## Input CSV Format

The input CSV must have these columns:

| Column | Description |
|--------|-------------|
| `answer_id` | Unique identifier for the answer (string) |
| `question` | The interview question text |
| `skill` | Skill/domain category (e.g., React, JavaScript, PHP, Laravel, SQL) |
| `answer_text` | The candidate's answer to evaluate |

Example:
```csv
answer_id,question,skill,answer_text
ans_001,"Explain Virtual DOM in React","React","The Virtual DOM is a lightweight representation..."
```

## Output CSV Format

The output CSV contains the original columns plus scoring results from both paths:

| Column | Description |
|--------|-------------|
| `answer_id` | From input |
| `question` | From input |
| `skill` | From input |
| `answer_text` | From input |
| `gemini_score` | Score from Gemini (1-10), or 0 if fallback used |
| `gemini_feedback` | Feedback text from Gemini, or error message |
| `gemini_fallback_used` | `1` if Gemini failed or no API key, `0` if Gemini succeeded |
| `heuristic_score` | Score from heuristic evaluator (1-10) |
| `heuristic_feedback` | Feedback text from heuristic evaluator |

## Environment Variables

### `GEMINI_API_KEY` (Optional)
- **Default**: Empty (not set)
- **Purpose**: Enables the Gemini 1.5 Flash scoring path
- **Source**: Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Behavior**: If not set or empty, all rows will have `gemini_fallback_used=1` and heuristic scores only

### `GEMINI_TEMPERATURE` (Optional)
- **Default**: `0`
- **Range**: `0.0` to `2.0`
- **Purpose**: Controls randomness in Gemini responses for reproducible experiments
- **Recommendation**: Set to `0` for deterministic, reproducible scoring in research studies
- **Behavior**: Passed to Gemini's `generationConfig.temperature` parameter

Example `.env` configuration:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_TEMPERATURE=0
```

## Determinism / Reproducibility

To ensure identical scores across runs:
1. Set `GEMINI_TEMPERATURE=0` in your `.env` file
2. The heuristic path is already fully deterministic
3. Re-running the script with the same input and `GEMINI_TEMPERATURE=0` should produce identical `gemini_score` values

## Interpreting Results

- **`gemini_fallback_used = 0`**: Gemini API call succeeded, score/feedback from LLM
- **`gemini_fallback_used = 1`**: Gemini unavailable (no API key, network error, or parsing failure), score/feedback empty or error message
- **Heuristic scores**: Always available, based on keyword matching, answer length, and question alignment

## Example Output

```csv
answer_id,question,skill,answer_text,gemini_score,gemini_feedback,gemini_fallback_used,heuristic_score,heuristic_feedback
ans_001,"Explain Virtual DOM...",React,"The Virtual DOM is...",8,"Excellent explanation of Virtual DOM and reconciliation. Covers diffing algorithm and performance benefits.",0,9,"Comprehensive and thorough response. Great use of key technical concepts: virtual dom, render, reconciliation."
ans_002,"What are React Hooks...",React,"React Hooks are functions...",7,"Good coverage of useState and useEffect. Could mention useContext or custom hooks.",0,8,"Clear and concise explanation. Great use of key technical concepts: state, effect, lifecycle."
ans_003,"How does the JavaScript Event Loop...",JavaScript,"The JavaScript Event Loop...",9,"Accurate description of microtasks vs macrotasks. Correctly explains Promise vs setTimeout ordering.",0,10,"Comprehensive and thorough response. Great use of key technical concepts: async, callback, promise, event loop."
```

## Requirements

- PHP 8.2+
- Laravel 12 (bootstrapped via `vendor/autoload.php` and `bootstrap/app.php`)
- No additional Composer packages required (uses built-in `fgetcsv`/`fputcsv`)

## Notes

- The script bootstraps Laravel to access the `AnswerController` private methods via reflection
- It does **not** start the web server or require a running database
- Existing API behavior (`POST /api/submit-answer`) is unchanged
- No authentication or middleware involved