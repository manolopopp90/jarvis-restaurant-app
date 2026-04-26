const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration aus Umgebungsvariablen
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/restaurant.db');
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '30');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `restaurant_${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, backupFile);

  // Backup-Verzeichnis erstellen
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Backup-Verzeichnis erstellt: ${BACKUP_DIR}`);
  }

  // Prüfen ob Datenbank existiert
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Datenbank nicht gefunden: ${DB_PATH}`);
    process.exit(1);
  }

  // Backup erstellen
  try {
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`✅ Backup erstellt: ${backupFile}`);
    
    // Metadaten speichern
    const metaPath = backupPath + '.json';
    const metadata = {
      timestamp: new Date().toISOString(),
      originalPath: DB_PATH,
      size: fs.statSync(backupPath).size,
      version: '1.0.0'
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
    
    console.log(`📊 Backup-Größe: ${(metadata.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Backup-Fehler:', error.message);
    process.exit(1);
  }
}

function cleanupOldBackups() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
  
  const files = fs.readdirSync(BACKUP_DIR);
  let deletedCount = 0;
  
  files.forEach(file => {
    if (file.startsWith('restaurant_') && file.endsWith('.db')) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        
        // Auch Metadaten-Datei löschen
        const metaPath = filePath + '.json';
        if (fs.existsSync(metaPath)) {
          fs.unlinkSync(metaPath);
        }
        
        deletedCount++;
        console.log(`🗑️ Gelöscht: ${file}`);
      }
    }
  });
  
  console.log(`🧹 ${deletedCount} alte Backups gelöscht (>${RETENTION_DAYS} Tage)`);
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('📦 Keine Backups vorhanden');
    return;
  }
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(file => {
      const stats = fs.statSync(path.join(BACKUP_DIR, file));
      return {
        name: file,
        size: (stats.size / 1024).toFixed(2) + ' KB',
        date: stats.mtime.toISOString()
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log('\n📦 Verfügbare Backups:');
  console.table(files);
}

// Hauptfunktion
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'backup';
  
  switch (command) {
    case 'backup':
      createBackup();
      cleanupOldBackups();
      break;
    case 'list':
      listBackups();
      break;
    case 'cleanup':
      cleanupOldBackups();
      break;
    default:
      console.log('Usage: node backup.js [backup|list|cleanup]');
      process.exit(1);
  }
}

main();
