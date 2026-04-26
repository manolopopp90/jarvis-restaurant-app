require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const db = require('./database-json');
const routes = require('./routes');
const { initWebSocket } = require('./websocket');

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP-Server für Express und Socket.io
const server = http.createServer(app);

// CORS-Konfiguration mit Tailscale-URL
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'https://desktop-lk7svi7.tailbc2e10.ts.net:8443',
      'http://localhost:5005',
      'http://localhost:3000'
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blockiert: ${origin}`);
      callback(new Error('Nicht erlaubter Origin'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};

// Sicherheits-Header
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss:;");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS Middleware
app.use(cors(corsOptions));

// Body Parser mit Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate Limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const data = requestCounts.get(ip);
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      data.count++;
    }
    
    if (data.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ 
        success: false, 
        error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' 
      });
    }
  }
  
  next();
});

// Statische Dateien für Frontend
app.use(express.static(path.join(__dirname, 'public')));

// API-Routen
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    websocket: 'aktiv'
  });
});

// SPA Fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API-Endpunkt nicht gefunden' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unbehandelter Fehler:', err);
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Interner Serverfehler',
    ...(isDevelopment && { stack: err.stack })
  });
});

// WebSocket initialisieren
initWebSocket(server);

// Server starten
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Seeblick Backend läuft auf Port ${PORT}`);
  console.log(`🔒 CORS erlaubt: ${allowedOrigins.join(', ')}`);
  console.log(`📊 Datenbank: JSON (${path.join(__dirname, 'seeblick.json')})`);
  console.log(`🔌 WebSocket: aktiviert`);
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
  console.log(`   GET    /health`);
});

module.exports = { app, server };
