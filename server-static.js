const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || 'http://backend:3000';

console.log('Starting server...');
console.log('API_URL:', API_URL);

// CORS für ALLE Requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Proxy API requests to backend
app.use('/api', (req, res) => {
  const backendUrl = new URL(API_URL);
  // Stelle sicher, dass der Pfad korrekt ist: /api + req.url
  const targetPath = '/api' + req.url;
  
  console.log('Proxying:', req.method, req.url, 'to', backendUrl.hostname + ':' + backendUrl.port + targetPath);
  
  const options = {
    hostname: backendUrl.hostname,
    port: backendUrl.port || 80,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: backendUrl.host
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    res.set(proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  });

  req.pipe(proxyReq);
});

// Static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API proxy to: ${API_URL}`);
});
