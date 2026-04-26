# Multi-Stage Build für Restaurant App

# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:20-alpine AS backend
RUN apk add --no-cache sqlite sqlite-dev
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
RUN mkdir -p /app/database

EXPOSE 3001
CMD ["node", "server-simple.js"]
