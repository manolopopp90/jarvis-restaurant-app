# Seeblick Restaurant App - Docker Deployment

## Schnellstart

### 1. Docker Container bauen und starten
```bash
docker-compose up -d
```

### 2. Container Status prüfen
```bash
docker-compose ps
```

### 3. Logs anzeigen
```bash
docker-compose logs -f
```

## Zugriff

### Lokal
- App: http://localhost:3002
- API: http://localhost:3002/api/

### Tailscale (Extern)
Nach dem Start ist die App über Tailscale erreichbar:
- URL: https://desktop-lk7svi7.tailbc2e10.ts.net:3002

## Docker Commands

### Container stoppen
```bash
docker-compose down
```

### Container neu bauen
```bash
docker-compose up -d --build
```

### Container restart
```bash
docker-compose restart
```

## Konfiguration

### Ports
- `3002` - Restaurant App (lokal)
- `80` - Nginx Reverse Proxy

### Volumes
- `./database:/app/database` - Persistente Datenbank

## Troubleshooting

### Container startet nicht
```bash
docker-compose down
docker-compose up -d --build
```

### Datenbank zurücksetzen
```bash
docker-compose down
rm -f database/restaurant.db
docker-compose up -d
```

## Support
Bei Problemen: `docker-compose logs -f` für detaillierte Logs
