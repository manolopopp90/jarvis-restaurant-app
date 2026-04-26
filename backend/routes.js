const express = require('express');
const router = express.Router();
const logger = require('./logger');
const db = require('./database-json');
const { 
  orderSchema, 
  reservationSchema, 
  qrScanSchema,
  validateRequest 
} = require('./validation');

// Hilfsfunktion: Prepared Statement Simulation (für zukünftige SQLite-Migration)
const executeQuery = (operation, data) => {
  logger.debug(`DB Operation: ${operation}`, data);
  return db[operation](data);
};

// Get all tables
router.get('/tables', (req, res) => {
  try {
    const tables = executeQuery('getTables');
    logger.info('Tables abgerufen', { count: tables.length });
    res.json({ success: true, data: tables });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Tische', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get table by number
router.get('/tables/:number', (req, res) => {
  try {
    const table = executeQuery('getTableByNumber', parseInt(req.params.number));
    if (!table) {
      logger.warn(`Tisch nicht gefunden: ${req.params.number}`);
      return res.status(404).json({ success: false, error: 'Table not found' });
    }
    logger.info('Tisch abgerufen', { tableNumber: table.tableNumber });
    res.json({ success: true, data: table });
  } catch (error) {
    logger.error('Fehler beim Abrufen des Tisches', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update table status
router.patch('/tables/:number/status', (req, res) => {
  try {
    const { status } = req.body;
    const table = executeQuery('updateTableStatus', {
      tableNumber: parseInt(req.params.number),
      status
    });
    
    logger.info('Tisch-Status aktualisiert', { 
      tableNumber: table.tableNumber, 
      status: table.status 
    });
    
    res.json({ success: true, data: table });
  } catch (error) {
    logger.error('Fehler beim Aktualisieren des Tisch-Status', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all orders
router.get('/orders', (req, res) => {
  try {
    const orders = executeQuery('getOrders');
    logger.info('Bestellungen abgerufen', { count: orders.length });
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Bestellungen', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create order
router.post('/orders', validateRequest(orderSchema), (req, res) => {
  try {
    const order = executeQuery('createOrder', req.validatedData);
    logger.info('Bestellung erstellt', { 
      orderId: order.id, 
      tableNumber: order.tableNumber,
      total: order.total 
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    logger.error('Fehler beim Erstellen der Bestellung', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get order by ID
router.get('/orders/:id', (req, res) => {
  try {
    const order = executeQuery('getOrderById', parseInt(req.params.id));
    if (!order) {
      logger.warn(`Bestellung nicht gefunden: ${req.params.id}`);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    logger.info('Bestellung abgerufen', { orderId: order.id });
    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Bestellung', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const order = executeQuery('updateOrderStatus', {
      id: parseInt(req.params.id),
      status
    });
    
    logger.info('Bestellstatus aktualisiert', { 
      orderId: order.id, 
      status: order.status 
    });
    
    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Fehler beim Aktualisieren des Bestellstatus', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// QR Scan
router.post('/qr-scan', validateRequest(qrScanSchema), (req, res) => {
  try {
    const scan = executeQuery('createQrScan', req.validatedData);
    logger.info('QR-Scan erstellt', { 
      tableNumber: scan.tableNumber,
      timestamp: scan.timestamp 
    });
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    logger.error('Fehler beim Erstellen des QR-Scans', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get QR scans
router.get('/qr-scans', (req, res) => {
  try {
    const scans = executeQuery('getQrScans');
    logger.info('QR-Scans abgerufen', { count: scans.length });
    res.json({ success: true, data: scans });
  } catch (error) {
    logger.error('Fehler beim Abrufen der QR-Scans', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stats
router.get('/stats', (req, res) => {
  try {
    const stats = executeQuery('getStats');
    logger.info('Statistiken abgerufen');
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Statistiken', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
