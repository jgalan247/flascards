# Flashcard Generator

AI-powered flashcard generator for teachers to create exam-focused study materials.

## Features

### For Teachers
- **10-Step Prompt Builder**: Guided wizard to create optimal AI prompts
- **AI Integration**: Copy prompts to ChatGPT/Claude and paste results back
- **Deck Management**: Create, edit, and organize flashcard decks
- **Share Links**: Generate shareable links for students

### For Students (No login required)
- **5 Study Modes**:
  - **Flashcards**: Classic flip cards with keyboard shortcuts
  - **Match**: Memory game matching questions with answers
  - **Learn**: Type answers and get instant feedback
  - **Test**: Multiple choice quiz with score tracking
  - **Gravity**: Action game with falling questions

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Django + Django REST Framework
- **Database**: SQLite
- **Hosting**: DigitalOcean Droplet ready

## Local Development

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## Deployment (DigitalOcean Droplet)

1. SSH into your droplet
2. Clone the repo to `/var/www/flashcards`
3. Update `nginx.conf` with your domain
4. Update `backend/flashcards/settings_prod.py` with allowed hosts
5. Run `./deploy.sh`

### Manual deployment steps:

```bash
# Backend
cd /var/www/flashcards/backend
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
python manage.py migrate --settings=flashcards.settings_prod
python manage.py collectstatic --noinput --settings=flashcards.settings_prod

# Frontend
cd /var/www/flashcards/frontend
npm install
npm run build

# Services
sudo systemctl restart flashcards
sudo systemctl restart nginx
```

## API Endpoints

```
POST   /api/auth/register/     # Teacher registration
POST   /api/auth/login/        # Teacher login
POST   /api/auth/logout/       # Logout
GET    /api/auth/me/           # Current teacher

GET    /api/decks/             # List teacher's decks
POST   /api/decks/             # Create deck with cards
GET    /api/decks/{slug}/      # Get deck details
PUT    /api/decks/{slug}/      # Update deck
DELETE /api/decks/{slug}/      # Delete deck

GET    /api/subjects/          # List teacher's subjects
POST   /api/subjects/          # Create subject

GET    /api/study/{slug}/      # Public deck access (for students)
```

## License

MIT
