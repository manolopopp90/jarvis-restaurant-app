// server-simple.js - Backend API für Restaurant App
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static Files aus frontend/dist
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// === TISCHE ===
app.get('/api/tische', (req, res) => {
  res.json([
    { id: 1, nummer: 1, name: 'Tisch 1', kapazitaet: 4, status: 'frei', x_position: 0, y_position: 0 },
    { id: 2, nummer: 2, name: 'Tisch 2', kapazitaet: 4, status: 'frei', x_position: 0, y_position: 0 },
    { id: 3, nummer: 3, name: 'Tisch 3', kapazitaet: 6, status: 'frei', x_position: 0, y_position: 0 },
    { id: 4, nummer: 4, name: 'Tisch 4', kapazitaet: 2, status: 'frei', x_position: 0, y_position: 0 },
    { id: 5, nummer: 5, name: 'Tisch 5', kapazitaet: 4, status: 'frei', x_position: 0, y_position: 0 },
    { id: 6, nummer: 6, name: 'Tisch 6', kapazitaet: 4, status: 'frei', x_position: 0, y_position: 0 },
    { id: 7, nummer: 7, name: 'Tisch 7', kapazitaet: 2, status: 'frei', x_position: 0, y_position: 0 },
    { id: 8, nummer: 8, name: 'Tisch 8', kapazitaet: 6, status: 'frei', x_position: 0, y_position: 0 },
    { id: 9, nummer: 9, name: 'Tisch 9', kapazitaet: 4, status: 'frei', x_position: 0, y_position: 0 },
    { id: 10, nummer: 10, name: 'Tisch 10', kapazitaet: 4, status: 'frei', x_position: 0, y_position: 0 }
  ]);
});

// === SPEISEKARTE ===
app.get('/api/speisekarte', (req, res) => {
  res.json({
    'Vorspeisen': {
      typ: 'speise',
      speisen: [
        { id: 1, name: 'Caprese Salat', beschreibung: 'Tomaten, Mozzarella, Basilikum', preis: 12.50 },
        { id: 2, name: 'Bruschetta', beschreibung: 'Geröstetes Brot mit Tomaten', preis: 8.50 }
      ]
    },
    'Hauptgerichte': {
      typ: 'speise',
      speisen: [
        { id: 3, name: 'Wiener Schnitzel', beschreibung: 'Paniertes Kalbfleisch mit Kartoffelsalat', preis: 24.00 },
        { id: 4, name: 'Zürcher Geschnetzeltes', beschreibung: 'Kalbfleisch in Rahmsauce mit Rösti', preis: 26.00 },
        { id: 5, name: 'Pasta Carbonara', beschreibung: 'Speck, Ei, Parmesan', preis: 18.50 },
        { id: 6, name: 'Pizza Margherita', beschreibung: 'Tomaten, Mozzarella, Basilikum', preis: 14.00 }
      ]
    },
    'Nachtische': {
      typ: 'speise',
      speisen: [
        { id: 7, name: 'Tiramisu', beschreibung: 'Mascarpone, Kaffee, Löffelbiskuit', preis: 9.50 },
        { id: 8, name: 'Panna Cotta', beschreibung: 'Vanillecreme mit Beeren', preis: 8.50 }
      ]
    },
    'Getränke': {
      typ: 'getraenk',
      speisen: [
        { id: 9, name: 'Cola', beschreibung: '0.33l', preis: 4.50 },
        { id: 10, name: 'Mineralwasser', beschreibung: '0.5l', preis: 3.50 },
        { id: 11, name: 'Apfelschorle', beschreibung: '0.33l', preis: 4.00 }
      ]
    },
    'Biere': {
      typ: 'getraenk',
      speisen: [
        { id: 12, name: 'Feldschlösschen', beschreibung: '0.5l', preis: 6.50 },
        { id: 13, name: 'Calanda', beschreibung: '0.5l', preis: 6.50 }
      ]
    },
    'Weine': {
      typ: 'getraenk',
      speisen: [
        { id: 14, name: 'Chardonnay', beschreibung: '1dl', preis: 8.00 },
        { id: 15, name: 'Merlot', beschreibung: '1dl', preis: 8.50 }
      ]
    },
    'Aperitifs': {
      typ: 'getraenk',
      speisen: [
        { id: 16, name: 'Aperol Spritz', beschreibung: 'Klassisch mit Orange', preis: 12.00 },
        { id: 17, name: 'Campari Soda', beschreibung: 'Mit Zitrone', preis: 10.00 }
      ]
    }
  });
});

// Fallback für SPA - index.html für alle nicht-API Routen
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Restaurant App Server läuft auf Port ${PORT}`);
});
