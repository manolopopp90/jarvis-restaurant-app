require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database-json');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien für Frontend
app.use(express.static(path.join(__dirname, 'public')));

// API-Routen
app.use('/api', routes);

// SPA Fallback für React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Seeblick Backend läuft auf Port ${PORT}`);
  console.log(`📊 Datenbank: JSON (${path.join(__dirname, 'seeblick.json')})`);
  console.log(`🌐 API-Endpoints:`);
  console.log(`   GET    /api/tables`);
  console.log(`   GET    /api/tables/:number`);
  console.log(`   PATCH  /api/tables/:number/status`);
  console.log(`   GET    /api/orders`);
  console.log(`   POST   /api/orders`);
  console.log(`   GET    /api/orders/:id`);
  console.log(`   PATCH  /api/orders/:id/status`);
  console.log(`   POST   /api/qr-scan`);
  console.log(`   GET    /api/qr-scans`);
  console.log(`   GET    /api/stats`);
});

module.exports = app;