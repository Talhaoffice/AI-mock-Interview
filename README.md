# 🤖 AI Mock Interview Platform

> A full-stack web application that simulates technical job interviews with timed questions, intelligent answer evaluation, and a downloadable PDF performance report.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup-terminal-1)
  - [Frontend Setup](#frontend-setup-terminal-2)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [How to Use](#how-to-use)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)

---

## Overview

**AI Mock Interview** is a decoupled full-stack web application designed to help software job candidates practice for technical interviews. Candidates are presented with domain-specific programming questions (React, JavaScript, PHP, Laravel, SQL, Node.js, CSS, API Design) one at a time under a strict **30-second countdown timer**.

After completing all questions, candidates receive a detailed performance report including:
- An aggregate score and performance tier badge
- A **Chart.js bar chart** breaking down scores by technology domain
- Per-question AI feedback and remarks
- A **downloadable PDF report card**

Administrators can manage the question bank through a protected CRUD panel.

> **Honest note on "AI":** Answer scoring uses a **dual-tier system**. When a Google Gemini API key is configured, answers are evaluated by Google's Gemini 1.5 Flash LLM. When no API key is present, a custom **domain-aware NLP heuristic engine** evaluates answers using keyword density and response depth — this is not a true large language model but produces reasonable, domain-specific feedback offline.

---

## Features

| Feature | Description |
|---|---|
| ⚡ Instant Demo Login | One-click Candidate and Admin demo access — no registration needed |
| ⏱️ Live Countdown Timer | Animated 30-second timer bar with color transitions (Cyan → Amber → Rose) |
| 🤖 Dual-Tier AI Scoring | Google Gemini 1.5 Flash (online) + Custom NLP heuristic engine (offline) |
| 📄 Resume Skill Scanner | Upload PDF/TXT resume — backend extracts skills and recommends matching questions |
| 📊 Analytics Results Page | Aggregate score, Chart.js domain bar chart, per-question AI feedback accordion |
| 📥 PDF Report Export | Client-side PDF generation via html2canvas + jsPDF |
| 🔧 Admin Question Panel | Full CRUD on question bank with real-time search and skill category filters |
| 🔐 Protected Routes | Admin-only routes guarded by role-based client-side protection |
| 🌐 REST API Backend | Laravel 12 REST API with CORS configuration and JSON responses |
| 🎨 Dark Glassmorphism UI | Premium dark design system with Plus Jakarta Sans font and micro-animations |

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| PHP | 8.4+ | Server-side language |
| Laravel | 12.x | REST API framework |
| Eloquent ORM | Built-in | Database abstraction |
| SQLite | 3.x | File-based database (zero config) |
| Google Gemini 1.5 Flash | API | LLM-based answer evaluation (optional) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI component library |
| React Router DOM | 7.x | Client-side routing / SPA |
| Chart.js | 4.x | Domain skill competency bar charts |
| jsPDF | 2.x | PDF report card generation |
| html2canvas | 1.x | DOM-to-canvas for PDF capture |
| Vanilla CSS | — | Dark glassmorphism design system |

---

## Project Structure

```
AI-mock-Interview/
├── backend/
│   └── interview-backend/          # Laravel 12 REST API
│       ├── app/
│       │   ├── Http/Controllers/
│       │   │   ├── AnswerController.php     # Core: AI scoring, session management
│       │   │   ├── QuestionController.php   # CRUD for question bank
│       │   │   ├── ResumeController.php     # PDF/TXT resume skill extraction
│       │   │   └── AdminController.php      # Admin panel data
│       │   └── Models/
│       │       ├── Question.php
│       │       ├── Answer.php
│       │       └── Attempt.php
│       ├── database/
│       │   ├── migrations/                  # Table schemas
│       │   └── seeders/
│       │       └── QuestionSeeder.php       # 10 starter interview questions
│       ├── routes/
│       │   └── api.php                      # All REST API route definitions
│       ├── config/
│       │   └── cors.php                     # CORS configuration
│       ├── .env.example                     # Environment template (safe to share)
│       └── composer.json
│
├── frontend/
│   └── interview-frontend/         # React 19 Single Page Application
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Login.jsx                # Landing / login page
│       │   │   ├── Dashboard.jsx            # Candidate hub + resume scanner
│       │   │   ├── Interview.jsx            # Timer + question engine
│       │   │   ├── Result.jsx               # Analytics + PDF export
│       │   │   └── Admin.jsx                # Question bank management
│       │   ├── components/
│       │   │   ├── Navbar.jsx               # Navigation + sign-out
│       │   │   └── ProtectedRoute.jsx       # Role-based route guard
│       │   ├── services/
│       │   │   └── api.js                   # Centralized HTTP client
│       │   ├── index.css                    # Global dark glassmorphism design system
│       │   └── App.js                       # Root router
│       └── package.json
│
├── README.md
└── .gitignore
```

---

## Prerequisites

Ensure these are installed on your system before starting:

| Requirement | Minimum Version | Check With |
|---|---|---|
| PHP | 8.2+ | `php --version` |
| Composer | 2.x | `composer --version` |
| Node.js | 18+ | `node --version` |
| NPM | 9+ | `npm --version` |
| SQLite | 3.x | Built into PHP — no install needed |
| Git | Any | `git --version` |

---

## Installation & Setup

### Backend Setup (Terminal 1)

```bash
# 1. Navigate to the backend directory
cd backend/interview-backend

# 2. Copy the environment template
cp .env.example .env        # Linux/Mac
# OR on Windows PowerShell:
Copy-Item .env.example .env

# 3. Generate the Laravel application encryption key
php artisan key:generate

# 4. Install PHP dependencies
# Use these flags on Windows to avoid Windows Defender file-lock issues:
composer install --prefer-dist --no-dev -o

# 5. Create the SQLite database file
# Linux/Mac:
touch database/database.sqlite
# Windows PowerShell:
New-Item -ItemType File -Path "database\database.sqlite" -Force

# 6. Run all database migrations
php artisan migrate --force

# 7. Seed the database with 10 starter interview questions
php artisan db:seed --force

# 8. Start the Laravel development server
php artisan serve
```

✅ **Verify backend is running:** Open `http://127.0.0.1:8000/api/test` — you should see `{"status":"online"}`.

---

### Frontend Setup (Terminal 2)

```bash
# 1. Navigate to the frontend directory
cd frontend/interview-frontend

# 2. Install JavaScript dependencies
# --legacy-peer-deps resolves React 19 peer dependency conflicts
npm install --legacy-peer-deps

# 3. Start the React development server
npm start
```

✅ The browser will automatically open `http://localhost:3000`.

> **Keep both terminals running simultaneously.** The frontend calls the backend API — if the backend is stopped, no data will load.

---

## Environment Configuration

### Backend (`backend/interview-backend/.env`)

After copying `.env.example` to `.env`, the key settings are:

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=                    # Auto-generated by: php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite        # Uses file-based SQLite — no DB server needed

# Optional: Enable real Gemini AI scoring
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=             # Leave empty to use offline NLP heuristic fallback
```

> **Never commit your `.env` file.** It contains your `APP_KEY` and any API keys. The `.gitignore` already excludes it.

### Switching to MySQL (Production)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_mock_interview
DB_USERNAME=root
DB_PASSWORD=your_password
```

Then run: `php artisan migrate --force && php artisan db:seed --force`

### Frontend (`frontend/interview-frontend/.env.local`)

Create this file if your backend runs on a different host/port:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

This is optional — the frontend defaults to `http://127.0.0.1:8000` if not set.

---

## Database Setup

The project uses **SQLite** by default — a zero-configuration, file-based database. The database file lives at `backend/interview-backend/database/database.sqlite` and is excluded from Git via `.gitignore`.

### Database Schema

| Table | Key Columns | Purpose |
|---|---|---|
| `questions` | `id`, `question`, `skill` | Interview question bank |
| `attempts` | `id`, `candidate_name`, `user_role`, `score`, `total_questions` | Interview session records |
| `answers` | `id`, `attempt_id`, `question_id`, `answer`, `score`, `feedback` | Per-question responses with AI scoring |

### Migrations and Seeder

```bash
# Create tables fresh
php artisan migrate --force

# Seed 10 starter questions
php artisan db:seed --force

# Reset everything (WARNING: deletes all data)
php artisan migrate:fresh --seed
```

---

## Running the Application

| Step | Command | URL |
|---|---|---|
| Start backend | `php artisan serve` (from `backend/interview-backend/`) | `http://127.0.0.1:8000` |
| Start frontend | `npm start` (from `frontend/interview-frontend/`) | `http://localhost:3000` |
| API health check | Visit in browser | `http://127.0.0.1:8000/api/test` |

---

## How to Use

### As a Candidate
1. Open `http://localhost:3000` and click **"Candidate Demo"**
2. *(Optional)* Upload your PDF or TXT resume in the **Resume Skill Scanner** — detected skills appear as badges and matching questions are prioritized
3. Click **"Start Mock Interview"** — a 30-second animated countdown timer begins
4. Answer each question and click **"Submit & Next"** (or let the timer auto-submit)
5. After all questions, view your results:
   - Overall score and performance tier (Exceptional / Proficient / Needs Practice)
   - Chart.js bar chart of your scores by technology domain
   - Per-question accordion with your answer and AI feedback
6. Click **"Download Official PDF"** to export your report card

### As an Administrator
1. Click **"Admin Demo"** on the login page
2. Navigate to the **Admin Panel** in the navbar
3. Use the **search bar** and **skill filter** to find questions
4. **Add**, **edit**, or **delete** questions from the question bank

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/test` | Health check — returns `{"status":"online"}` |
| `GET` | `/api/questions` | Fetch all questions (optional `?skills=react,php` filter) |
| `POST` | `/api/add-question` | Add a new question `{question, skill}` |
| `PUT` | `/api/questions/{id}` | Update a question |
| `DELETE` | `/api/questions/{id}` | Delete a question |
| `POST` | `/api/start-attempt` | Begin interview session — returns `{attempt_id}` |
| `POST` | `/api/submit-answer` | Submit one answer — returns `{score, feedback}` |
| `POST` | `/api/save-attempt` | Finalize interview with cumulative score |
| `GET` | `/api/results?attempt_id={id}` | Fetch results for one specific attempt |
| `POST` | `/api/upload-resume` | Upload PDF/TXT resume — returns detected skills |

---

## Screenshots

> _Screenshots will be added after deployment. The sections below describe what each screen looks like._

| Screen | Description |
|---|---|
| **Login Page** | Dark glassmorphism card with platform branding and one-click demo buttons |
| **Dashboard** | Personalized greeting, interview instructions, Resume Skill Scanner with skill badges |
| **Interview** | Question card with animated color-shifting 30-second countdown progress bar and character counter |
| **Results** | Score badge, Chart.js domain bar chart, expandable per-question AI feedback accordion |
| **Admin Panel** | Question table with live search, skill filter dropdown, edit modal, and delete confirmation |

---

## Known Limitations

| Limitation | Detail |
|---|---|
| No real authentication | Login is simulated via `sessionStorage`. No password hashing or JWT tokens. |
| Admin auth is client-side only | `ProtectedRoute.jsx` guards UI only — backend API endpoints are publicly accessible. |
| Offline NLP scoring is heuristic | The offline fallback evaluates keyword density, not true language understanding. |
| SQLite not production-safe | File-level locking causes issues with concurrent multi-user writes. Use MySQL/PostgreSQL in production. |
| No question randomization | Questions are returned in database insertion order — same order every time. |
| No candidate history | Candidates cannot view past interview attempts or score trends. |
| Resume parsing is basic | Uses binary ASCII extraction from PDFs — complex layouts or scanned PDFs may not parse correctly. |

---

## Future Improvements

- 🔐 **Laravel Sanctum** authentication with proper user accounts and JWT tokens
- 🔀 **Question randomization** with configurable question count
- 🗣️ **Voice interview mode** using the Web Speech API
- 📈 **Candidate history dashboard** with attempt trends over time
- 📅 **Interview scheduling** — HR assigns question sets to specific candidates
- 🐳 **Docker Compose** containerization for one-command deployment
- 🗄️ **MySQL/PostgreSQL** migration for production scalability
- ⚡ **Redis caching** for the questions endpoint
- 📧 **Automatic email delivery** of the PDF report upon completion

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit: `git commit -m "Add: description of your feature"`
5. Push: `git push origin feature/your-feature-name`
6. Open a Pull Request

---

## Author

**Talha** — Junior Full-Stack Engineer, Computer Science Graduate (Class of 2026)

---

*Built with Laravel 12, React 19, and Google Gemini 1.5 Flash*
