require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien für Frontend
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// 📋 TISCHE
// ============================================

// GET /api/tische - Alle Tische abrufen
app.get('/api/tische', (req, res) => {
  db.all('SELECT * FROM tische ORDER BY nummer', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// PUT /api/tische/:id/status - Tischstatus aktualisieren
app.put('/api/tische/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['frei', 'besetzt', 'reserviert'].includes(status)) {
    return res.status(400).json({ 
      error: 'Ungültiger Status. Erlaubt: frei, besetzt, reserviert' 
    });
  }

  db.run(
    'UPDATE tische SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tisch nicht gefunden' });
      }
      res.json({ 
        success: true, 
        message: 'Tischstatus aktualisiert',
        tisch_id: id,
        status: status
      });
    }
  );
});

// ============================================
// 📖 SPEISEKARTE
// ============================================

// GET /api/speisekarte - Vollständige Speisekarte abrufen
app.get('/api/speisekarte', (req, res) => {
  const query = `
    SELECT 
      k.id as kategorie_id,
      k.name as kategorie_name,
      k.sortierung,
      s.id as speise_id,
      s.name as speise_name,
      s.beschreibung,
      s.preis,
      s.bild_url,
      s.allergene,
      s.aktiv
    FROM kategorien k
    LEFT JOIN speisen s ON k.id = s.kategorie_id
    WHERE k.aktiv = 1 AND (s.aktiv = 1 OR s.aktiv IS NULL)
    ORDER BY k.sortierung, s.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Gruppieren nach Kategorien
    const menu = {};
    rows.forEach(row => {
      if (!menu[row.kategorie_id]) {
        menu[row.kategorie_id] = {
          id: row.kategorie_id,
          name: row.kategorie_name,
          sortierung: row.sortierung,
          speisen: []
        };
      }
      if (row.speise_id) {
        menu[row.kategorie_id].speisen.push({
          id: row.speise_id,
          name: row.speise_name,
          beschreibung: row.beschreibung,
          preis: row.preis,
          bild_url: row.bild_url,
          allergene: row.allergene,
          aktiv: row.aktiv
        });
      }
    });

    res.json({ 
      success: true, 
      data: Object.values(menu) 
    });
  });
});

// ============================================
// 🛒 BESTELLUNGEN
// ============================================

// GET /api/bestellungen - Alle Bestellungen abrufen
app.get('/api/bestellungen', (req, res) => {
  const { status, tisch_id } = req.query;
  let query = 'SELECT b.*, t.nummer as tisch_nummer FROM bestellungen b JOIN tische t ON b.tisch_id = t.id';
  const params = [];

  if (status) {
    query += ' WHERE b.status = ?';
    params.push(status);
  }
  if (tisch_id) {
    query += params.length ? ' AND' : ' WHERE';
    query += ' b.tisch_id = ?';
    params.push(tisch_id);
  }

  query += ' ORDER BY b.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// POST /api/bestellungen - Neue Bestellung erstellen
app.post('/api/bestellungen', (req, res) => {
  const { tisch_id, positionen, notiz } = req.body;

  // Validierung
  if (!tisch_id || !positionen || !Array.isArray(positionen) || positionen.length === 0) {
    return res.status(400).json({ 
      error: 'tisch_id und positionen (Array) sind erforderlich' 
    });
  }

  // Prüfen ob Tisch existiert und frei ist
  db.get('SELECT * FROM tische WHERE id = ?', [tisch_id], (err, tisch) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!tisch) {
      return res.status(404).json({ error: 'Tisch nicht gefunden' });
    }
    if (tisch.status === 'reserviert') {
      return res.status(400).json({ error: 'Tisch ist reserviert' });
    }

    // Speisen validieren und Preise holen
    const speiseIds = positionen.map(p => p.speise_id);
    const placeholders = speiseIds.map(() => '?').join(',');
    
    db.all(`SELECT id, preis FROM speisen WHERE id IN (${placeholders}) AND aktiv = 1`, speiseIds, (err, speisen) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (speisen.length !== positionen.length) {
        return res.status(400).json({ error: 'Eine oder mehrere Speisen nicht gefunden oder inaktiv' });
      }

      const preisMap = {};
      speisen.forEach(s => preisMap[s.id] = s.preis);

      let gesamtbetrag = 0;
      const validatedPositionen = positionen.map(p => {
        const einzelpreis = preisMap[p.speise_id];
        const menge = parseInt(p.menge) || 1;
        const gesamtpreis = einzelpreis * menge;
        gesamtbetrag += gesamtpreis;

        return {
          speise_id: p.speise_id,
          menge: menge,
          einzelpreis: einzelpreis,
          gesamtpreis: gesamtpreis,
          notiz: p.notiz || null
        };
      });

      // Transaktion starten
      db.run('BEGIN TRANSACTION');

      // Bestellung erstellen
      db.run(
        'INSERT INTO bestellungen (tisch_id, status, gesamtbetrag, notiz) VALUES (?, ?, ?, ?)',
        [tisch_id, 'offen', gesamtbetrag, notiz || null],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          const bestellungId = this.lastID;

          // Bestellpositionen einfügen
          const insertPositionen = validatedPositionen.map(p => {
            return new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO bestellpositionen (bestellung_id, speise_id, menge, einzelpreis, gesamtpreis, notiz) VALUES (?, ?, ?, ?, ?, ?)',
                [bestellungId, p.speise_id, p.menge, p.einzelpreis, p.gesamtpreis, p.notiz],
                function(err) {
                  if (err) reject(err);
                  else resolve({ id: this.lastID, ...p });
                }
              );
            });
          });

          Promise.all(insertPositionen)
            .then(positionenResult => {
              // Tisch als besetzt markieren
              db.run(
                'UPDATE tische SET status = ? WHERE id = ?',
                ['besetzt', tisch_id],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                  }

                  db.run('COMMIT');
                  res.status(201).json({
                    success: true,
                    message: 'Bestellung erfolgreich erstellt',
                    bestellung: {
                      id: bestellungId,
                      tisch_id: tisch_id,
                      status: 'offen',
                      gesamtbetrag: gesamtbetrag,
                      notiz: notiz || null,
                      positionen: positionenResult
                    }
                  });
                }
              );
            })
            .catch(err => {
              db.run('ROLLBACK');
              res.status(500).json({ error: err.message });
            });
        }
      );
    });
  });
});

// GET /api/bestellungen/:id - Einzelne Bestellung mit Positionen abrufen
app.get('/api/bestellungen/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT b.*, t.nummer as tisch_nummer FROM bestellungen b JOIN tische t ON b.tisch_id = t.id WHERE b.id = ?',
    [id],
    (err, bestellung) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!bestellung) {
        return res.status(404).json({ error: 'Bestellung nicht gefunden' });
      }

      db.all(
        `SELECT bp.*, s.name as speise_name 
         FROM bestellpositionen bp 
         JOIN speisen s ON bp.speise_id = s.id 
         WHERE bp.bestellung_id = ?`,
        [id],
        (err, positionen) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({
            success: true,
            data: { ...bestellung, positionen }
          });
        }
      );
    }
  );
});

// PUT /api/bestellungen/:id/status - Bestellstatus aktualisieren
app.put('/api/bestellungen/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['offen', 'in_bearbeitung', 'serviert', 'abgeschlossen', 'storniert'].includes(status)) {
    return res.status(400).json({ 
      error: 'Ungültiger Status. Erlaubt: offen, in_bearbeitung, serviert, abgeschlossen, storniert' 
    });
  }

  db.run(
    'UPDATE bestellungen SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Bestellung nicht gefunden' });
      }

      // Wenn Bestellung abgeschlossen oder storniert, Tisch wieder freigeben
      if (status === 'abgeschlossen' || status === 'storniert') {
        db.get('SELECT tisch_id FROM bestellungen WHERE id = ?', [id], (err, row) => {
          if (!err && row) {
            db.run('UPDATE tische SET status = ? WHERE id = ?', ['frei', row.tisch_id]);
          }
        });
      }

      res.json({ 
        success: true, 
        message: 'Bestellstatus aktualisiert',
        bestellung_id: id,
        status: status
      });
    }
  );
});

// ============================================
// 📊 DASHBOARD / STATISTIKEN
// ============================================

// GET /api/dashboard - Dashboard-Daten
app.get('/api/dashboard', (req, res) => {
  const queries = {
    tische_gesamt: 'SELECT COUNT(*) as count FROM tische',
    tische_besetzt: 'SELECT COUNT(*) as count FROM tische WHERE status = "besetzt"',
    bestellungen_heute: `SELECT COUNT(*) as count FROM bestellungen WHERE date(created_at) = date('now')`,
    umsatz_heute: `SELECT COALESCE(SUM(gesamtbetrag), 0) as sum FROM bestellungen WHERE date(created_at) = date('now') AND status != 'storniert'`,
    offene_bestellungen: 'SELECT COUNT(*) as count FROM bestellungen WHERE status IN ("offen", "in_bearbeitung")'
  };

  const results = {};
  let completed = 0;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, row) => {
      if (err) results[key] = 0;
      else results[key] = row.count || row.sum || 0;
      
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json({ success: true, data: results });
      }
    });
  });
});

// ============================================
// ❌ FEHLERBEHANDLUNG
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint nicht gefunden' });
});

// Globaler Error Handler
app.use((err, req, res, next) => {
  console.error('Serverfehler:', err.stack);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

// ============================================
// 🚀 SERVER STARTEN
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 Restaurant-Server läuft auf Port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📁 Statische Dateien: ./public\n`);
  
  // Datenbank initialisieren
  initDatabase();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Server wird heruntergefahren...');
  db.close(() => {
    console.log('✅ Datenbankverbindung geschlossen');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 Server wird heruntergefahren...');
  db.close(() => {
    console.log('✅ Datenbankverbindung geschlossen');
    process.exit(0);
  });
});

module.exports = app;
