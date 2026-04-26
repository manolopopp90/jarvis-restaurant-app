// init-db.js - Datenbank Initialisierung
const fs = require('fs');
const path = require('path');
const { db } = require('./db');

const schemaPath = path.join(__dirname, 'database/schema.sql');

console.log('🗄️  Initialisiere Datenbank...');

// Schema ausführen
const schema = fs.readFileSync(schemaPath, 'utf8');

// SQL Statements splitten und ausführen
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

statements.forEach((stmt, index) => {
  try {
    db.exec(stmt + ';');
    console.log(`✅ Statement ${index + 1} ausgeführt`);
  } catch (err) {
    console.error(`❌ Fehler bei Statement ${index + 1}:`, err.message);
  }
});

console.log('🎉 Datenbank erfolgreich initialisiert!');
console.log('📊 Tabellen erstellt: tische, kategorien, speisen, bestellungen, bestellpositionen, tagesumsaetze');

// Verbindung schliessen
db.close((err) => {
  if (err) {
    console.error('❌ Fehler beim Schliessen:', err.message);
  } else {
    console.log('👋 Verbindung geschlossen');
  }
});
