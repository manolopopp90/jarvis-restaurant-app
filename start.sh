#!/bin/sh
set -e

echo "🚀 Starting Restaurant App..."

# Start Node.js backend in background
cd /app
node server-simple.js &
NODE_PID=$!

echo "📡 Backend started (PID: $NODE_PID)"

# Start nginx in foreground (this keeps container running)
echo "🌐 Starting nginx..."
nginx -g 'daemon off;'
