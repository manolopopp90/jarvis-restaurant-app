#!/bin/bash
# SQLite Backup Skript für Restaurant-App
# Sollte als Cronjob laufen: 0 */6 * * * /pfad/zu/backup.sh

# Konfiguration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_PATH="${DB_PATH:-./database/restaurant.db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="restaurant_${TIMESTAMP}.db"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Backup-Verzeichnis erstellen
mkdir -p "$BACKUP_DIR"

# Prüfen ob Datenbank existiert
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Datenbank nicht gefunden: $DB_PATH"
    exit 1
fi

# SQLite Backup (sichere Kopie)
if command -v sqlite3 &> /dev/null; then
    sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/$BACKUP_FILE'"
    echo "✅ Backup erstellt: $BACKUP_FILE"
else
    # Fallback: Einfache Dateikopie
    cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_FILE"
    echo "✅ Backup erstellt (Dateikopie): $BACKUP_FILE"
fi

# Alte Backups löschen (älter als RETENTION_DAYS)
find "$BACKUP_DIR" -name "restaurant_*.db" -mtime +$RETENTION_DAYS -delete
echo "🗑️ Alte Backups (>${RETENTION_DAYS} Tage) gelöscht"

# Liste der letzten 5 Backups anzeigen
echo "📦 Letzte Backups:"
ls -lt "$BACKUP_DIR" | head -6
