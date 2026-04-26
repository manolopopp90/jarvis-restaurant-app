const { Server } = require('socket.io');

let io = null;

function initWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
        'https://desktop-lk7svi7.tailbc2e10.ts.net:8443',
        'http://localhost:5005',
        'http://localhost:3000'
      ],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client verbunden: ${socket.id}`);
    
    // Client joinen Admin-Raum für Dashboard-Updates
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log(`👤 ${socket.id} ist Admin-Raum beigetreten`);
    });
    
    // Client joinen Tisch-Raum für Bestell-Updates
    socket.on('join-table', (tableNumber) => {
      socket.join(`table-${tableNumber}`);
      console.log(`🪑 ${socket.id} ist Tisch ${tableNumber} beigetreten`);
    });
    
    socket.on('disconnect', () => {
      console.log(`🔌 Client getrennt: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket Server initialisiert');
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
  console.log(`📢 Neue Bestellung #${order.id} an Admin gesendet`);
}

function notifyOrderStatusUpdate(order) {
  if (!io) return;
  io.to('admin-room').emit('order-status-changed', order);
  io.to(`table-${order.tableNumber}`).emit('order-status-changed', order);
  console.log(`📢 Bestellstatus-Update #${order.id} gesendet`);
}

function notifyTableStatusUpdate(table) {
  if (!io) return;
  io.to('admin-room').emit('table-status-changed', table);
  console.log(`📢 Tisch-Status-Update #${table.tableNumber} gesendet`);
}

function notifyNewQrScan(scan) {
  if (!io) return;
  io.to('admin-room').emit('new-qr-scan', scan);
  console.log(`📢 Neuer QR-Scan an Admin gesendet`);
}

module.exports = {
  initWebSocket,
  getIO,
  notifyNewOrder,
  notifyOrderStatusUpdate,
  notifyTableStatusUpdate,
  notifyNewQrScan
};
