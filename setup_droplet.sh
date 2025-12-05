#!/bin/bash
# ===========================================
# Flashcard Generator - DigitalOcean Setup
# Domain: flashcards.cshub.org.je
# ===========================================

set -e

DOMAIN="flashcards.cshub.org.je"
APP_DIR="/var/www/flashcards"
REPO_URL="https://github.com/jgalan247/flascards.git"

echo "============================================"
echo "  Flashcard Generator - Server Setup"
echo "  Domain: $DOMAIN"
echo "============================================"

# Update system
echo ""
echo "[1/8] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python
echo ""
echo "[2/8] Installing Python..."
sudo apt install python3 python3-pip python3-venv -y

# Install Node.js
echo ""
echo "[3/8] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
echo ""
echo "[4/8] Installing Nginx..."
sudo apt install nginx -y

# Install Git
echo ""
echo "[5/8] Installing Git..."
sudo apt install git -y

# Clone repository
echo ""
echo "[6/8] Cloning repository..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
cd $APP_DIR

if [ -d ".git" ]; then
    echo "Repository exists, pulling latest..."
    git pull origin main
else
    git clone $REPO_URL .
fi

# Setup Backend
echo ""
echo "[7/8] Setting up Django backend..."
cd $APP_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Create production settings with domain
cat > flashcards/settings_prod.py << 'SETTINGS_EOF'
"""
Production settings for flashcards project.
Domain: flashcards.cshub.org.je
"""
from .settings import *
import os

DEBUG = False

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-production-secret-key-change-this')

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'flashcards.cshub.org.je',
    'www.flashcards.cshub.org.je',
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://flashcards.cshub.org.je',
    'http://flashcards.cshub.org.je',
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    'https://flashcards.cshub.org.je',
    'http://flashcards.cshub.org.je',
]

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

STATIC_ROOT = BASE_DIR / 'staticfiles'
SETTINGS_EOF

# Run migrations and collect static
python manage.py migrate --settings=flashcards.settings_prod
python manage.py collectstatic --noinput --settings=flashcards.settings_prod

deactivate

# Setup Frontend
echo ""
echo "[8/8] Building React frontend..."
cd $APP_DIR/frontend

# Create production env file
echo "VITE_API_URL=https://$DOMAIN/api" > .env.production

npm install
npm run build

# Create Gunicorn service
echo ""
echo "Configuring Gunicorn service..."
sudo tee /etc/systemd/system/flashcards.service > /dev/null << SERVICE_EOF
[Unit]
Description=Gunicorn daemon for Flashcards Django app
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/flashcards/backend
Environment="DJANGO_SETTINGS_MODULE=flashcards.settings_prod"
ExecStart=/var/www/flashcards/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 flashcards.wsgi:application

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Create Nginx config
echo ""
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/flashcards > /dev/null << NGINX_EOF
server {
    listen 80;
    server_name flashcards.cshub.org.je www.flashcards.cshub.org.je;

    # Frontend - React built files
    location / {
        root /var/www/flashcards/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django static files
    location /static/ {
        alias /var/www/flashcards/backend/staticfiles/;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
NGINX_EOF

# Set proper permissions
echo ""
echo "Setting permissions..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# Enable and start services
echo ""
echo "Starting services..."
sudo ln -sf /etc/nginx/sites-available/flashcards /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo systemctl daemon-reload
sudo systemctl enable flashcards
sudo systemctl restart flashcards

sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
echo ""
echo "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Your app is now running at:"
echo "  http://flashcards.cshub.org.je"
echo ""
echo "Next steps:"
echo "  1. Point your DNS A record to this server's IP"
echo "  2. (Optional) Add SSL with: sudo certbot --nginx -d flashcards.cshub.org.je"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status flashcards  - Check Django status"
echo "  sudo systemctl restart flashcards - Restart Django"
echo "  sudo systemctl restart nginx      - Restart Nginx"
echo "  sudo journalctl -u flashcards     - View Django logs"
echo ""
