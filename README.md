# Flashcard Generator for Teachers

A web application that helps teachers create AI-powered flashcards for their students. Teachers build structured prompts using a 10-step wizard, generate flashcards via ChatGPT/Claude or NotebookLM, and share interactive study modes with students.

## Features

### For Teachers
- **10-Step Prompt Builder**: Guided wizard to create exam-board-specific prompts
  - Subject, Topic, Learning Objectives
  - Exam Board selection with nuances (AQA, Edexcel, OCR, etc.)
  - Common misconceptions targeting
  - Year group and target grade customization
  - Accessibility considerations (dyslexia-friendly, ADHD-friendly)

- **Dual Prompt Modes**:
  - **ChatGPT/Claude**: General AI prompt for flashcard generation
  - **NotebookLM**: Source-grounded prompt that references uploaded documents

- **Deck Management**: Create, edit, organize, and share flashcard decks

### For Students
Five interactive study modes (no login required):
1. **Flashcards**: Classic flip cards with keyboard navigation
2. **Learn**: Adaptive learning with typed answers and progress tracking
3. **Match**: Drag-and-drop matching game with timer
4. **Test**: Multiple choice and written quizzes with scoring
5. **Gravity**: Gamified mode where answers fall from the sky

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite |
| Backend | Django 5 + Django REST Framework |
| Database | SQLite |
| Styling | CSS (custom) |
| Authentication | Session-based (teachers only) |

## Project Structure

```
flashcardsEdu/
├── backend/
│   ├── api/                 # Django REST API
│   │   ├── models.py        # Teacher, Subject, Deck, Card
│   │   ├── views.py         # API endpoints
│   │   └── serializers.py   # DRF serializers
│   └── flashcards/          # Django settings
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── teacher/     # Dashboard, PromptBuilder, DeckManager
│   │   │   ├── student/     # Study mode components
│   │   │   └── common/      # LoadingSpinner, shared components
│   │   └── utils/
│   │       └── promptGenerator.js  # Prompt generation logic
│   └── public/
├── deploy.sh                # Deployment script
├── nginx.conf               # Nginx configuration
└── gunicorn.service         # Systemd service file
```

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd flashcardsEdu/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # For admin access
python manage.py runserver
```

### Frontend Setup
```bash
cd flashcardsEdu/frontend
npm install
npm run dev
```

The app runs at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

## Security Features

- **CSRF Protection**: Token-based protection on all forms
- **Session Timeout**: 24-hour automatic logout
- **Rate Limiting**:
  - Login: 5 attempts/minute
  - Registration: 3 attempts/hour
- **Password Requirements**: 8+ characters, uppercase, lowercase, number, special character

## Deployment (DigitalOcean)

### Why DigitalOcean?
This app uses Django with SQLite, which requires:
- A persistent server process (Gunicorn)
- Persistent filesystem for SQLite database
- Traditional server architecture (not serverless)

A $6/month droplet handles ~100 teachers easily.

### Deployment Steps
1. Create a DigitalOcean droplet (Ubuntu 22.04)
2. Clone the repository to `/var/www/flashcards`
3. Set environment variables:
   ```bash
   export DJANGO_SECRET_KEY='your-secret-key'
   export DROPLET_IP='your.server.ip'
   ```
4. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Post-Deployment
- Create superuser on production server for password resets:
  ```bash
  cd /var/www/flashcards/backend
  source venv/bin/activate
  python manage.py createsuperuser --settings=flashcards.settings_prod
  ```

## How It Works

1. **Teacher creates account** and logs in
2. **Builds a prompt** using the 10-step wizard
3. **Copies prompt** to ChatGPT, Claude, or NotebookLM
4. **Pastes JSON response** back into the app
5. **Creates a deck** with the generated flashcards
6. **Shares the link** with students
7. **Students study** using any of the 5 modes (no login needed)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Teacher registration |
| POST | `/api/auth/login/` | Teacher login |
| GET | `/api/subjects/` | List teacher's subjects |
| POST | `/api/decks/` | Create deck with cards |
| GET | `/api/decks/{slug}/` | Get deck by slug (public) |
| PATCH | `/api/cards/{id}/` | Update card |

## License

MIT
