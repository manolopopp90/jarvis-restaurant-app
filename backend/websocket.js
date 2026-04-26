const { Server } = require('socket.io');
const logger = require('./logger');

let io = null;

function initWebSocket(httpServer) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
    'https://desktop-lk7svi7.tailbc2e10.ts.net:8443',
    'http://localhost:5005',
    'http://localhost:3000'
  ];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client verbunden: ${socket.id}`);
    
    socket.on('join-admin', () => {
      socket.join('admin-room');
      logger.info(`👤 ${socket.id} ist Admin-Raum beigetreten`);
    });
    
    socket.on('join-table', (tableNumber) => {
      socket.join(`table-${tableNumber}`);
      logger.info(`🪑 ${socket.id} ist Tisch ${tableNumber} beigetreten`);
    });
    
    socket.on('disconnect', () => {
      logger.info(`🔌 Client getrennt: ${socket.id}`);
    });
    
    socket.on('error', (error) => {
      logger.error(`WebSocket Fehler: ${error.message}`, { socketId: socket.id });
    });
  });

  logger.info('✅ WebSocket Server initialisiert');
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('WebSocket nicht initialisiert!');
  }
  return io;
}

// Hilfsfunktionen für Events
function notifyNewOrder(order) {
  if (!io) return;
  io.to('admin-room').emit('new-order', order);
  io.to(`table-${order.tableNumber}`).emit('order-updated', order);
  logger.info(`📢 Neue Bestellung #${order.id} an Admin gesendet`);
}

function notifyOrderStatusUpdate(order) {
  if (!io) return;
  io.to('admin-room').emit('order-status-changed', order);
  io.to(`table-${order.tableNumber}`).emit('order-status-changed', order);
  logger.info(`📢 Bestellstatus-Update #${order.id} gesendet`);
}

function notifyTableStatusUpdate(table) {
  if (!io) return;
  io.to('admin-room').emit('table-status-changed', table);
  logger.info(`📢 Tisch-Status-Update #${table.tableNumber} gesendet`);
}

function notifyNewQrScan(scan) {
  if (!io) return;
  io.to('admin-room').emit('new-qr-scan', scan);
  logger.info(`📢 Neuer QR-Scan an Admin gesendet`);
}

module.exports = {
  initWebSocket,
  getIO,
  notifyNewOrder,
  notifyOrderStatusUpdate,
  notifyTableStatusUpdate,
  notifyNewQrScan
};
