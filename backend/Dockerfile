FROM node:20-alpine

WORKDIR /app

# Create app directory and set permissions
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to node user
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY --chown=node:node . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server-new.js"]