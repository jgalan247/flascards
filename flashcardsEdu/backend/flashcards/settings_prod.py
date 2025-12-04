"""
Production settings for flashcards project.
"""
from .settings import *
import os

DEBUG = False

# Get secret key from environment variable in production
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', SECRET_KEY)

# Allow your domain and server IP
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    # Add your domain here
    # 'flashcards.yourdomain.com',
]

# Add your droplet IP
DROPLET_IP = os.environ.get('DROPLET_IP', '')
if DROPLET_IP:
    ALLOWED_HOSTS.append(DROPLET_IP)

# CORS settings for production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    # Add your domain here
    # 'https://flashcards.yourdomain.com',
]

# Add droplet to CORS
if DROPLET_IP:
    CORS_ALLOWED_ORIGINS.append(f'http://{DROPLET_IP}')

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Session settings
SESSION_COOKIE_AGE = 86400  # 24 hours in seconds
SESSION_COOKIE_SECURE = False  # Set to True with HTTPS
CSRF_COOKIE_SECURE = False  # Set to True with HTTPS
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# Static files
STATIC_ROOT = BASE_DIR / 'staticfiles'
