# Restaurant App - Docker Production Setup

## 🎯 Optimized Multi-Stage Build

Single Docker image with:
- ✅ Frontend (pre-built)
- ✅ Backend (Node.js)
- ✅ Nginx (static files + API proxy)
- ✅ SQLite database
- ✅ Health checks
- ✅ Gzip compression
- ✅ Security headers

## 📁 Files

| File | Purpose |
|------|---------|
| `Dockerfile.optimized` | Multi-stage build (Node → Nginx Alpine) |
| `docker-compose.prod.yml` | Production deployment config |
| `nginx-prod.conf` | Optimized nginx configuration |
| `start.sh` | Container startup script |

## 🚀 Quick Start

```bash
# Build and run
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## 🔧 Configuration

- **Port:** 3001 (exposed)
- **Database:** `./database/restaurant.db` (persistent volume)
- **Static Files:** Served directly by nginx (cached 1 year)
- **API:** Proxied to Node.js backend

## 📊 Resource Limits

- CPU: 1 core (limit), 0.25 (reserved)
- Memory: 512MB (limit), 128MB (reserved)

## 🏥 Health Check

```bash
curl http://localhost:3001/health
```

## 🔒 Security

- Non-root user for Node.js
- Security headers (X-Frame-Options, XSS Protection)
- No server tokens
