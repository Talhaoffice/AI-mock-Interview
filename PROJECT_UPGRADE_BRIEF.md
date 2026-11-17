# AI Mock Interview Project — Upgrade Briefing

**Prepared:** 10 November 2026  
**Repository:** `AI-mock-Interview-main`  
**Purpose:** Give a future developer or AI agent a reliable map of the current application, its implemented behavior, and the most important upgrade constraints.

## 1. Executive summary

This is a two-part web application for practicing technical interviews:

- A React single-page frontend provides demo login, candidate dashboard, timed question flow, results, PDF export, and an admin question editor.
- A Laravel 12 JSON API stores questions, attempts, and submitted answers in SQLite by default. It scores answers with a Gemini API call when configured, then uses a local keyword/length heuristic as a fallback.

The core practice loop is implemented end to end: fetch every question, create an attempt, submit and score answers one at a time, save a final total, and load per-attempt results. Admin CRUD screens also call backend endpoints.

Despite the “AI” product framing, the app currently has no real account system or backend authorization. Login accepts any non-empty email/password, the role is inferred from a hard-coded email, and the API routes are public. Treat it as a local demo/prototype until authentication, authorization, validation, and data integrity are upgraded.

## 2. Repository map

```text
README.md
backend/interview-backend/       Laravel 12 API
  app/Http/Controllers/          Answer, question, resume, admin handlers
  app/Models/                    Question, Attempt, Answer, User
  database/migrations/           Laravel base tables and app tables
  database/seeders/              10 starter technical questions
  routes/api.php                 API route definitions
  config/                        Laravel configuration
frontend/interview-frontend/     React 19 SPA (Create React App)
  src/App.js                     Client routes
  src/pages/                     Login, Dashboard, Interview, Result, Admin
  src/components/                Navbar and client route guard
  src/services/api.js            Fetch wrappers for API calls
ss/                              Four UI screenshots
```

Dependencies are already vendored/installed in the repository in some directories; avoid treating `backend/interview-backend/vendor/` or frontend dependency files as first-party application code.

## 3. Technology and runtime

### Frontend

- React 19.2, React Router 7, Create React App (`react-scripts`)
- Plain CSS in `src/index.css` / `src/App.css`, with many page-level inline styles
- `react-chartjs-2` + Chart.js for the skill chart
- `html2canvas` + `jspdf` for client-side report export
- Central API base in `src/services/api.js`: `REACT_APP_API_URL || "http://127.0.0.1:8000/api"`

### Backend

- PHP ^8.2, Laravel ^12, Eloquent ORM
- SQLite configured as the default database in the project README and Laravel config
- Optional Google Gemini API call is made directly from `AnswerController`
- No dedicated service layer or authentication middleware is currently evident in app routes

## 4. Modules and responsibilities

| Module | Files | Responsibility and behavior |
|---|---|---|
| SPA routing | `frontend/interview-frontend/src/App.js` | Maps `/` to login; `/dashboard`, `/interview`, `/result` to candidate-protected pages; `/admin` to client role-guarded admin page. |
| Demo login | `src/pages/Login.jsx` | Accepts any non-empty email/password. Exact email `admin@gmail.com` receives role `admin`; every other email is candidate/user. Writes hard-coded token, role, and candidate name to `localStorage`. Guest shortcut does the same without credentials. No backend login request occurs. |
| Route guard and navigation | `src/components/ProtectedRoute.jsx`, `src/components/Navbar.jsx` | Checks browser `localStorage` token and role only; logout clears all local storage. This is a UI convenience, not security. |
| Candidate dashboard | `src/pages/Dashboard.jsx` | Displays greeting and start-interview button. Uploads a selected resume and displays detected skill badges. Although the API returns recommended questions, the page does not display or use them. |
| Interview runner | `src/pages/Interview.jsx` | Loads all questions; creates an attempt; starts 30-second timer per question; sends answer to API and stores returned score; saves aggregate attempt on last answer; navigates to results. Submission failure logs an error and advances anyway. |
| Results and export | `src/pages/Result.jsx` | Fetches answers for `lastAttemptId`; renders total, skill totals, per-answer feedback and a bar chart; captures the result DOM into a PDF. Overall score is a sum, not a normalized percentage. |
| Admin question bank | `src/pages/Admin.jsx` | Loads all questions; supports local text search and exact skill filtering; create/edit/delete question calls. Frontend route guard checks only localStorage. |
| API client | `src/services/api.js` | Thin Fetch API wrappers for questions, attempts, submissions, results, and resume uploads. Error messages discard backend validation details. |
| Question API | `app/Http/Controllers/QuestionController.php` | Lists, creates, updates, and deletes question records. Create validates question and skill; update has no explicit validation. |
| Admin API | `app/Http/Controllers/AdminController.php` | Separate add-question handler, but not used by the frontend; it also has no server-side authorization. |
| Attempt/answer/evaluation API | `app/Http/Controllers/AnswerController.php` | Creates attempt, evaluates and stores answer, reads result data, updates/creates final attempt, performs Gemini request or heuristic fallback. |
| Resume parser | `app/Http/Controllers/ResumeController.php` | Reads TXT or attempts a basic PDF printable-text extraction, detects skills with predefined regex terms, returns skills and up to 10 matching questions. |
| Persistence | `app/Models/*`, `database/migrations/*` | Models map question bank, attempts, and per-question answers. Starter questions are inserted by `QuestionSeeder`. |

## 5. Main user flows

### Candidate interview

1. Login writes a fake `token`, `role`, and `candidateName` into browser local storage.
2. Dashboard navigates to `/interview`.
3. Interview calls `GET /api/questions`; currently it uses the full list without shuffle or resume-based filtering.
4. Interview calls `POST /api/start-attempt` with candidate name, role, and number of questions.
5. For each question, manual submit or the 30-second timeout calls `POST /api/submit-answer` with question ID, answer text, attempt ID, and role.
6. Backend evaluates answer and persists an `answers` row. On Gemini failure/no key, local heuristic scoring runs.
7. After final response, frontend sums scores and calls `POST /api/save-attempt`, then navigates to `/result`.
8. Results calls `GET /api/results?attempt_id=...`; backend joins answers to questions and computes skill totals/averages.
9. PDF is rendered in the browser from the result card; it is not generated or stored by the API.

### Resume scan

1. Dashboard sends multipart form field `resume` to `POST /api/upload-resume`.
2. Backend allows a file up to 5 MB, extracts text, detects known skills, and queries questions by skill.
3. Response includes `skills_found`, `skills_count`, and `recommended_questions`.
4. Current frontend renders only `skills_found`; the recommendations do not change the interview question set.

### Admin question maintenance

1. Admin demo login only sets a client-side role.
2. `/admin` loads `GET /api/questions`.
3. Create calls `POST /api/questions`; edit calls `PUT /api/questions/{id}`; delete calls `DELETE /api/questions/{id}`.
4. These endpoints are all public in `routes/api.php`; anyone who can reach the API can modify the question bank.

## 6. API reference (actual routes)

All routes are declared in `backend/interview-backend/routes/api.php`; Laravel prefixes them with `/api`.

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/api/test` | inline health check | Returns online status/message. |
| GET | `/api/questions` | `QuestionController@index` | Returns all question rows. No filtering/pagination. |
| POST | `/api/questions` | `QuestionController@store` | Used by frontend create. Requires question and skill. |
| PUT | `/api/questions/{id}` | `QuestionController@update` | No validation rules; updates question and skill. |
| DELETE | `/api/questions/{id}` | `QuestionController@destroy` | Deletes a question; related answers are cascaded by question FK. |
| POST | `/api/admin/add-question` | `AdminController@addQuestion` | Alternate add route, currently unused by frontend. |
| POST | `/api/start-attempt` | `AnswerController@startAttempt` | Creates attempt; input is not validated. |
| POST | `/api/submit-answer` | `AnswerController@submit` | Validates question ID and answer, then scores/persists. Attempt ID is not validated. |
| POST | `/api/save-attempt` | `AnswerController@saveAttempt` | Validates score only; updates an attempt or creates a new one. |
| GET | `/api/results` | `AnswerController@result` | Optional `attempt_id`; if omitted, selects latest attempt. |
| POST | `/api/upload-resume` | `ResumeController@upload` | Multipart upload, 5MB cap; extension/content policy is not robustly enforced. |

**Configuration note:** The frontend default base URL already ends in `/api`. If `REACT_APP_API_URL` is set, it must likewise include `/api`, e.g. `http://127.0.0.1:8000/api`. README currently gives an example without `/api`, which would make frontend paths wrong.

## 7. Data model

- `questions`: `id`, `question`, `skill`, timestamps. Model also allows `difficulty` and `sample_answer`, but current schema does not define those fields.
- `attempts`: `id`, `user_role`, `candidate_name`, aggregate `score`, `total_questions`, timestamps.
- `answers`: `id`, `question_id` (FK, cascade delete), nullable `attempt_id`, `user_role`, answer text, score, feedback, timestamps. `attempt_id` currently has no database foreign key constraint.
- `users`, sessions/password reset, jobs/cache: standard Laravel skeleton tables; the application login flow does not use the users table.

Relationships in Eloquent are `Attempt hasMany Answer`, `Answer belongsTo Attempt`, `Question hasMany Answer`, and `Answer belongsTo Question`.

## 8. Scoring behavior

### Gemini path

When `GEMINI_API_KEY` is present, `AnswerController` posts question, skill, and answer to the Gemini 1.5 Flash `generateContent` endpoint with an 8-second timeout. It extracts a JSON object from the model text, clamps score into 1–10, and uses returned feedback. Exceptions are logged and fall through to the heuristic. Non-success responses or unparsable responses also fall through silently.

### Local heuristic path

The heuristic:

- Gives very short answers (<4 words) score 2 and returns early.
- Otherwise awards points for response length, known skill keywords, and overlap with long words from the question; caps at 10.
- Produces fixed/template feedback, not semantic correctness checking.
- Uses a limited keyword map (React, JavaScript, PHP, Laravel, SQL, Node, CSS, general); unknown skills use general terms.

This is suitable as a demo fallback, not an objective or calibrated interview assessment. Gemini version/model identifier should be revisited because the code hard-codes a specific model API path.

## 9. Implemented UX features

- Candidate/admin demo access and guest shortcut
- 30-second per-question timer with changing colors and progress bar
- Question skill badge and character counter
- Auto-submit on timer expiry
- Resume skill detection and server response with recommendations
- Admin CRUD, search, and skill filter
- Results breakdown grouped by skill and answer-level feedback
- Client-side PDF download
- Dark visual theme and responsive flex/grid layout

## 10. Discrepancies and upgrade risks

### Critical: fresh database migration likely fails

The initial `2026_01_23_083932_create_answers_table.php` already creates `answers.attempt_id`. Later, `2026_10_03_135515_add_attempt_id_to_answers_table.php` unconditionally adds the same column. On a clean database, migrations therefore attempt to create a duplicate column. Verify and repair the migration history before relying on clean setup or CI. A safe upgrade should account for existing installations, not only edit an already-applied migration without a migration strategy.

### Critical: no real authentication or authorization

- Login is entirely client-side and accepts arbitrary credentials.
- Admin role is based on a literal email address.
- API routes have no auth middleware; create/update/delete are public.
- `attempt_id` can be supplied or omitted without ownership checks, and result lookup is not user-scoped.

Use Laravel Sanctum or an equivalent server-side identity model; enforce admin permissions on API routes and scope attempts/results to authenticated users.

### High: resume recommendations are disconnected

The backend returns recommended questions, but dashboard ignores that field and interview always reloads all questions. To make resume matching real, preserve selected question IDs/skills in app state or backend session and pass them into interview initialization; otherwise revise UI claims to say the scan only reports detected skills.

### High: reliability and score semantics

- Interview advances even when answer submission fails, so the answer may be lost and the final result may omit it.
- Final score is a raw total, while performance thresholds are hard-coded (12/25/40), making labels depend on question count. A normalized score and explicit denominator would scale better.
- Empty answers are replaced with a sentence then scored (likely 2) rather than explicitly treated as skipped.
- Result fallback to latest attempt can expose another user's data once real users exist; avoid unscoped fallback.
- Timer and navigation state should be reviewed when refactoring interview state handling.

### High: resume upload and parsing

- Frontend accept list includes PDF/TXT/DOC/DOCX; backend accepts any file type up to 5MB and attempts raw byte reading for other extensions.
- PDF extraction is a lightweight regex over raw PDF bytes; it will fail on many compressed, scanned, or complex-layout PDFs.
- No MIME/extension allowlist or content parsing library is used.
- Candidate recommendations may be inaccurate because exact skill naming/case varies between extracted labels and question categories.

Add strict server-side type validation, parser library/OCR strategy as needed, parsing limits, and tests for known file samples.

### Medium: model/schema drift and API validation

- `Question::$fillable` includes `difficulty`, `sample_answer`; migration has no such columns.
- Update endpoint does not validate input; start/save endpoints validate incompletely; attempt ID has no FK.
- `QuestionController::store` uses `$request->all()` rather than an explicit validated payload.
- API error detail is hidden by frontend wrappers, making backend validation failures harder to diagnose.

### Medium: project docs and naming drift

- README lists `POST /api/add-question`; actual route is `/api/admin/add-question`, while the UI uses `/api/questions`.
- README says upload accepts PDF/TXT, but dashboard file chooser advertises DOC/DOCX too.
- README's frontend API URL example omits `/api` even though code appends endpoint paths to the configured base.
- README lists React 19 and Laravel 12; package manifests confirm React 19 and Laravel ^12, but PHP composer requirement is `^8.2`, while README mentions PHP 8.4 in its tech table and 8.2+ in prerequisites.

### Medium: architecture and maintainability

- Controllers contain HTTP parsing, business rules, external LLM transport, scoring, persistence, and aggregation together.
- UI pages mix state, data fetching, and presentation; styles are mostly inline.
- No pagination/search API; admin loads all questions.
- No question randomization or configurable interview length.
- API client has no shared auth/header/error parsing layer.
- Tests appear to be Laravel and CRA starter examples; no domain-specific behavior coverage was identified from the inspected project files.

## 11. Suggested upgrade order

1. **Make setup reproducible:** resolve duplicate migration; reconcile README routes and API URL; confirm a clean local database can migrate and seed.
2. **Secure the API:** implement real authentication and roles; protect admin CRUD; authorize attempts and results by owner; remove hard-coded tokens and email role logic.
3. **Protect data integrity:** add validated request objects or equivalent validation; define DB foreign key from answers to attempts; make attempt creation/submission/finalization state rules explicit; use transactions where appropriate.
4. **Fix interview behavior:** do not silently skip failed submission; handle retries/offline state; make question selection configurable and optionally randomized; connect resume-selected questions if that feature remains promised.
5. **Clarify evaluation:** isolate evaluator behind a service/interface; make provider/model configurable; validate structured provider output; normalize aggregate scores and show denominator; log provider/model and fallback reason without leaking secrets or answer data unnecessarily.
6. **Improve resume handling:** allow only intended file types, use a robust PDF parser, make supported formats explicit, and test recommendation matching against canonical skill IDs.
7. **Improve UI/API contract:** standardize API response shapes, expose useful validation errors, add loading/empty/error states and accessible form labels, centralize styles/components.
8. **Add targeted tests and CI:** API feature tests for route permissions, attempt lifecycle, score bounds, resume validation, question CRUD, and frontend flow tests; migrations on a fresh DB should be part of CI.
9. **Production readiness:** replace SQLite where concurrent writes matter, configure secrets via environment, disable debug, add rate limiting and upload limits, deployment/backup/monitoring docs.

## 12. Good initial files for a future AI to read

Read these in order to understand the full vertical slice:

1. `README.md`
2. `backend/interview-backend/routes/api.php`
3. `frontend/interview-frontend/src/App.js`
4. `frontend/interview-frontend/src/services/api.js`
5. `frontend/interview-frontend/src/pages/Interview.jsx`
6. `backend/interview-backend/app/Http/Controllers/AnswerController.php`
7. `backend/interview-backend/app/Models/{Attempt,Answer,Question}.php`
8. Relevant migrations and `database/seeders/QuestionSeeder.php`
9. `frontend/interview-frontend/src/pages/{Dashboard,Result,Admin,Login}.jsx`
10. `backend/interview-backend/app/Http/Controllers/ResumeController.php`

## 13. Suggested prompt for the next AI

> Read `PROJECT_UPGRADE_BRIEF.md` and verify its claims against the current source before editing. Preserve the current React + Laravel split unless the requested upgrade requires changing it. Start with the clean migration failure and API security gaps; propose a small staged plan, then implement the requested stage. Do not assume the demo login is authentication. Keep API contracts, migrations, frontend consumers, README, and tests aligned. Before changing existing migrations, consider databases where those migrations may already have run. Report files changed, behavior changed, migration/rollback implications, and verification performed.

## 14. Evidence and scope

This report is based on static inspection of the README, frontend pages and API wrappers, Laravel routes/controllers/models, migrations, and seeders. No application was started and no tests or migrations were run as part of this analysis. Runtime behavior—especially the duplicate migration failure—should be confirmed during the first controlled setup/CI pass.
