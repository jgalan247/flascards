"""
Database backup management command.

Usage:
    python manage.py backup_db                    # Create SQLite backup
    python manage.py backup_db --json             # Also export to JSON
    python manage.py backup_db --keep 7           # Keep last 7 backups (default)
    python manage.py backup_db --list             # List existing backups
    python manage.py backup_db --restore <file>   # Restore from backup
"""

import os
import shutil
import json
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command
from django.conf import settings


class Command(BaseCommand):
    help = 'Backup the SQLite database and optionally export to JSON'

    def add_arguments(self, parser):
        parser.add_argument(
            '--json',
            action='store_true',
            help='Also export data to JSON format (portable)',
        )
        parser.add_argument(
            '--keep',
            type=int,
            default=7,
            help='Number of backups to keep (default: 7)',
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List existing backups',
        )
        parser.add_argument(
            '--restore',
            type=str,
            help='Restore from a backup file',
        )
        parser.add_argument(
            '--backup-dir',
            type=str,
            default=None,
            help='Custom backup directory (default: backend/backups)',
        )

    def handle(self, *args, **options):
        # Determine backup directory
        base_dir = Path(settings.BASE_DIR)
        backup_dir = Path(options['backup_dir']) if options['backup_dir'] else base_dir / 'backups'
        backup_dir.mkdir(parents=True, exist_ok=True)

        # Get database path
        db_path = base_dir / 'db.sqlite3'

        if options['list']:
            self.list_backups(backup_dir)
            return

        if options['restore']:
            self.restore_backup(options['restore'], db_path, backup_dir)
            return

        # Create backup
        self.create_backup(db_path, backup_dir, options['json'], options['keep'])

    def list_backups(self, backup_dir):
        """List all existing backups."""
        sqlite_backups = sorted(backup_dir.glob('db_*.sqlite3'), reverse=True)
        json_backups = sorted(backup_dir.glob('db_*.json'), reverse=True)

        if not sqlite_backups and not json_backups:
            self.stdout.write(self.style.WARNING('No backups found.'))
            return

        self.stdout.write(self.style.SUCCESS('\n=== SQLite Backups ==='))
        for backup in sqlite_backups:
            size = backup.stat().st_size / 1024  # KB
            modified = datetime.fromtimestamp(backup.stat().st_mtime)
            self.stdout.write(f'  {backup.name} ({size:.1f} KB) - {modified:%Y-%m-%d %H:%M}')

        if json_backups:
            self.stdout.write(self.style.SUCCESS('\n=== JSON Backups ==='))
            for backup in json_backups:
                size = backup.stat().st_size / 1024
                modified = datetime.fromtimestamp(backup.stat().st_mtime)
                self.stdout.write(f'  {backup.name} ({size:.1f} KB) - {modified:%Y-%m-%d %H:%M}')

        self.stdout.write('')

    def restore_backup(self, backup_file, db_path, backup_dir):
        """Restore from a backup file."""
        # Check if it's a full path or just filename
        backup_path = Path(backup_file)
        if not backup_path.is_absolute():
            backup_path = backup_dir / backup_file

        if not backup_path.exists():
            raise CommandError(f'Backup file not found: {backup_path}')

        if backup_path.suffix == '.sqlite3':
            # Create a safety backup of current database first
            if db_path.exists():
                safety_backup = backup_dir / f'db_pre_restore_{datetime.now():%Y%m%d_%H%M%S}.sqlite3'
                shutil.copy2(db_path, safety_backup)
                self.stdout.write(f'Created safety backup: {safety_backup.name}')

            # Restore SQLite backup
            shutil.copy2(backup_path, db_path)
            self.stdout.write(self.style.SUCCESS(f'Restored database from: {backup_path.name}'))

        elif backup_path.suffix == '.json':
            # For JSON, we need to use loaddata
            # First backup current database
            if db_path.exists():
                safety_backup = backup_dir / f'db_pre_restore_{datetime.now():%Y%m%d_%H%M%S}.sqlite3'
                shutil.copy2(db_path, safety_backup)
                self.stdout.write(f'Created safety backup: {safety_backup.name}')

            # Load JSON data
            call_command('loaddata', str(backup_path), verbosity=0)
            self.stdout.write(self.style.SUCCESS(f'Restored data from: {backup_path.name}'))

        else:
            raise CommandError(f'Unsupported backup format: {backup_path.suffix}')

    def create_backup(self, db_path, backup_dir, include_json, keep_count):
        """Create a new backup."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        if not db_path.exists():
            raise CommandError(f'Database not found: {db_path}')

        # SQLite backup
        sqlite_backup = backup_dir / f'db_{timestamp}.sqlite3'
        shutil.copy2(db_path, sqlite_backup)
        size_kb = sqlite_backup.stat().st_size / 1024
        self.stdout.write(self.style.SUCCESS(f'Created SQLite backup: {sqlite_backup.name} ({size_kb:.1f} KB)'))

        # JSON export (optional)
        if include_json:
            json_backup = backup_dir / f'db_{timestamp}.json'
            with open(json_backup, 'w') as f:
                call_command('dumpdata',
                    'api',  # Only backup the api app data
                    '--indent', '2',
                    '--output', str(json_backup),
                    verbosity=0
                )
            if json_backup.exists():
                size_kb = json_backup.stat().st_size / 1024
                self.stdout.write(self.style.SUCCESS(f'Created JSON backup: {json_backup.name} ({size_kb:.1f} KB)'))

        # Cleanup old backups
        self.cleanup_old_backups(backup_dir, keep_count)

    def cleanup_old_backups(self, backup_dir, keep_count):
        """Remove old backups, keeping only the most recent ones."""
        # Cleanup SQLite backups
        sqlite_backups = sorted(backup_dir.glob('db_*.sqlite3'), reverse=True)
        for old_backup in sqlite_backups[keep_count:]:
            old_backup.unlink()
            self.stdout.write(f'Removed old backup: {old_backup.name}')

        # Cleanup JSON backups
        json_backups = sorted(backup_dir.glob('db_*.json'), reverse=True)
        for old_backup in json_backups[keep_count:]:
            old_backup.unlink()
            self.stdout.write(f'Removed old backup: {old_backup.name}')
