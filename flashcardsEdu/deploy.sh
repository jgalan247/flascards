#!/bin/bash
# Deployment script for Flashcard Generator

set -e

echo "=== Flashcard Generator Deployment Script ==="

# Variables
APP_DIR="/var/www/flashcards"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Create directory structure
echo "Creating directories..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Backend setup
echo "Setting up backend..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Run migrations
python manage.py migrate --settings=flashcards.settings_prod
python manage.py collectstatic --noinput --settings=flashcards.settings_prod

# Frontend build
echo "Building frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# Setup systemd service
echo "Setting up Gunicorn service..."
sudo cp $APP_DIR/gunicorn.service /etc/systemd/system/flashcards.service
sudo systemctl daemon-reload
sudo systemctl enable flashcards
sudo systemctl restart flashcards

# Setup Nginx
echo "Setting up Nginx..."
sudo cp $APP_DIR/nginx.conf /etc/nginx/sites-available/flashcards
sudo ln -sf /etc/nginx/sites-available/flashcards /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=== Deployment complete! ==="
echo "Visit your server IP to see the app"
