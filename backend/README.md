# Restaurant Ordering App Backend

Professionelles Node.js/Express Backend mit SQLite Datenbank für ein Restaurant-Bestellsystem.

## 🚀 Schnellstart

```bash
# Abhängigkeiten installieren
npm install

# Server starten
npm start

# Oder mit nodemon (Auto-Reload)
npm run dev
```

Der Server läuft auf `http://localhost:3000`

## 📋 API Endpunkte

### Tische
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/tische` | Alle Tische abrufen |
| PUT | `/api/tische/:id/status` | Tischstatus aktualisieren (frei/besetzt/reserviert) |

### Speisekarte
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/speisekarte` | Vollständige Speisekarte (gruppiert nach Kategorien) |

### Bestellungen
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/bestellungen` | Alle Bestellungen abrufen (optional: ?status=&tisch_id=) |
| POST | `/api/bestellungen` | Neue Bestellung erstellen |
| GET | `/api/bestellungen/:id` | Einzelne Bestellung mit Positionen |
| PUT | `/api/bestellungen/:id/status` | Bestellstatus aktualisieren |

### Dashboard
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/dashboard` | Statistiken (Tische, Umsatz, Bestellungen) |

## 📝 Beispiel-Requests

### Neue Bestellung erstellen
```bash
curl -X POST http://localhost:3000/api/bestellungen \
  -H "Content-Type: application/json" \
  -d '{
    "tisch_id": 1,
    "notiz": "Bitte schnell",
    "positionen": [
      { "speise_id": 2, "menge": 2, "notiz": "Ohne Zwiebeln" },
      { "speise_id": 5, "menge": 1 }
    ]
  }'
```

### Tischstatus aktualisieren
```bash
curl -X PUT http://localhost:3000/api/tische/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "besetzt"}'
```

## 🗄️ Datenbank-Schema

- **tische** - Restauranttische mit Status
- **kategorien** - Speisekategorien
- **speisen** - Menüpunkte
- **bestellungen** - Bestellungen mit Gesamtbetrag
- **bestellpositionen** - Einzelpositionen einer Bestellung

## 📦 Technologien

- Node.js
- Express.js
- SQLite3
- CORS
- dotenv

## ⚙️ Konfiguration

Erstelle eine `.env` Datei:
```
PORT=3000
```

## 🎨 Frontend

Platziere Frontend-Dateien im `public/` Ordner - sie werden automatisch serviert.
