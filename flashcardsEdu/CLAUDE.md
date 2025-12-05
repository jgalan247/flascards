# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered flashcard generator for teachers to create exam-focused study materials. Teachers build flashcard decks via a guided prompt builder, and students access 5 study modes without login.

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

### Production Deployment
```bash
# Uses settings_prod.py for production
python manage.py migrate --settings=flashcards.settings_prod
python manage.py collectstatic --noinput --settings=flashcards.settings_prod
```

## Architecture

### Backend (`backend/`)
- **Django REST Framework** API with session-based auth
- Custom `Teacher` model (not Django's User) with email verification and password reset
- Models: `Teacher` → `Subject` → `Deck` → `Card`
- Decks accessed via unique slugs for shareable URLs
- Email service via Resend API (`api/email_service.py`)

### Frontend (`frontend/`)
- **React 19** with Vite and React Router
- Two user contexts:
  - **Teacher** (authenticated): `/`, `/create`, `/deck/:slug/edit`
  - **Student** (public): `/study/:slug/*` routes
- API client with CSRF handling in `src/utils/api.js`
- Utilities: `cardParser.js` (parse AI output), `promptGenerator.js` (build prompts), `exportFormats.js`

### Key Components
- **Teacher**: `Login`, `Dashboard`, `PromptBuilder` (10-step wizard), `DeckManager`
- **Student**: `DeckLanding`, `Flashcards`, `MatchGame`, `LearnMode`, `TestMode`, `GravityGame`

## API Structure

All API routes under `/api/`:
- Auth: `auth/register/`, `auth/login/`, `auth/logout/`, `auth/me/`, `auth/verify/`, `auth/forgot-password/`, `auth/reset-password/`
- Resources: REST endpoints via DRF router for `subjects/` and `decks/`
- Public: `study/<slug>/` for student access

## Environment Variables

- `VITE_API_URL`: Frontend API base URL (default: `http://localhost:8000/api`)
- `RESEND_API_KEY`: Email service API key
- `FRONTEND_URL`: For email verification links
