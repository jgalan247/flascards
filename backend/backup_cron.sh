#!/bin/bash
# Automated database backup script for cron
#
# Setup on server (run as root or with sudo):
#   1. Copy this script to /var/www/flashcards/backend/backup_cron.sh
#   2. Make executable: chmod +x /var/www/flashcards/backend/backup_cron.sh
#   3. Add to crontab: crontab -e
#   4. Add line for daily backup at 2 AM:
#      0 2 * * * /var/www/flashcards/backend/backup_cron.sh >> /var/log/flashcards_backup.log 2>&1
#
# Or for every 6 hours:
#      0 */6 * * * /var/www/flashcards/backend/backup_cron.sh >> /var/log/flashcards_backup.log 2>&1

set -e

# Configuration
APP_DIR="/var/www/flashcards"
BACKEND_DIR="$APP_DIR/backend"
BACKUP_DIR="$BACKEND_DIR/backups"
KEEP_BACKUPS=14  # Keep 2 weeks of daily backups

# Logging
echo "=========================================="
echo "Backup started at $(date)"
echo "=========================================="

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Activate virtual environment and run backup
cd "$BACKEND_DIR"
source venv/bin/activate

# Run the backup command with JSON export
python manage.py backup_db --json --keep $KEEP_BACKUPS --settings=flashcards.settings_prod

echo "Backup completed at $(date)"
echo ""

# Optional: Sync to remote storage (uncomment and configure if needed)
# Example for DigitalOcean Spaces or S3:
# aws s3 sync $BACKUP_DIR s3://your-bucket/flashcards-backups/ --delete

# Example for rsync to another server:
# rsync -avz $BACKUP_DIR/ user@backup-server:/backups/flashcards/
