# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered flashcard generator for UK teachers to create exam-focused study materials. Teachers build flashcard decks via a 10-step guided prompt builder (targeting UK exam boards like AQA, Edexcel, OCR), and students access 5 study modes without login.

## Development Commands

### Backend (Django)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Runs on http://localhost:8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev      # Runs on http://localhost:5173
npm run build    # Production build
npm run lint     # ESLint
```

### Testing
```bash
cd backend
python manage.py test api  # Run Django tests
```

### Production
```bash
python manage.py migrate --settings=flashcards.settings_prod
python manage.py collectstatic --noinput --settings=flashcards.settings_prod
```

## Architecture

### Backend (`backend/api/`)
- **Django REST Framework** with session-based auth (not JWT)
- **SQLite** database (default Django db.sqlite3)
- Custom `Teacher` model (not Django's User) with `is_verified`, `verification_token`, `reset_token` fields
- Model hierarchy: `Teacher` → `Subject` → `Deck` → `Card`
- Decks use auto-generated unique slugs for shareable URLs (`/study/:slug`)
- Rate limiting on auth endpoints: 5 logins/min, 3 registrations/hour
- Email via Resend API (`email_service.py`)

### Frontend (`frontend/src/`)
- **React 19** + Vite + React Router v7
- Auth state managed in `App.jsx` via `teacher` state and `checkAuth()` on mount
- API client (`utils/api.js`) handles CSRF tokens automatically via axios interceptor
- Components organized by user type: `components/teacher/` and `components/student/`

### Key Utilities
- `cardParser.js`: Parses AI output in multiple formats (JSON, markdown tables, numbered lists, Q:/A: pairs) + fuzzy matching via Levenshtein distance for Learn mode
- `promptGenerator.js`: Generates prompts with `generatePrompt()` for ChatGPT and `generateNotebookLMPrompt()` for NotebookLM (source-constrained)
- `exportFormats.js`: Exports to Quizlet (TSV), Kahoot (CSV), Anki (TSV), JSON, printable HTML

### Data Flow
1. Teacher uses PromptBuilder → copies generated prompt to ChatGPT/NotebookLM
2. Teacher pastes AI response → `cardParser.parseCards()` extracts Q/A pairs
3. Cards saved to deck via `PUT /api/decks/:slug/update_cards/`
4. Students access via public slug URL, no auth needed

## API Endpoints

Base: `/api/`
- **Auth**: `auth/register/`, `auth/login/`, `auth/logout/`, `auth/me/`, `auth/verify/`, `auth/forgot-password/`, `auth/reset-password/`
- **Resources**: DRF router for `subjects/` and `decks/` (CRUD)
- **Deck actions**: `decks/:slug/update_cards/` (PUT) - replaces all cards
- **Public**: `study/<slug>/` - no auth, returns deck with cards

## Database Backup

### Manual Backup Commands
```bash
cd backend
source venv/bin/activate
python manage.py backup_db              # Create SQLite backup
python manage.py backup_db --json       # Also export to JSON (portable)
python manage.py backup_db --list       # List existing backups
python manage.py backup_db --restore db_20241208_120000.sqlite3  # Restore
```

### Automated Backups (Production)
The `backup_cron.sh` script runs daily via cron. Setup on server:
```bash
chmod +x /var/www/flashcards/backend/backup_cron.sh
crontab -e
# Add: 0 2 * * * /var/www/flashcards/backend/backup_cron.sh >> /var/log/flashcards_backup.log 2>&1
```

Backups are stored in `backend/backups/` with automatic cleanup (keeps last 14 days).

## Environment Variables

- `VITE_API_URL`: Frontend API base (default: `http://localhost:8000/api`)
- `RESEND_API_KEY`: Email service
- `FRONTEND_URL`: For email verification/reset links
- `EMAIL_FROM`: Sender address for emails
