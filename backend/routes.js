const express = require('express');
const router = express.Router();
const db = require('./database-json');
const { validate, qrScanSchema, orderSchema, tableStatusSchema, orderStatusSchema } = require('./validation');

// Hilfsfunktion für Prepared Statement Simulation (JSON-DB)
// Bei Umstellung auf SQLite: db.prepare(sql).get(params)
function safeQuery(operation, ...params) {
  try {
    // Parameter-Sanitisierung
    const sanitized = params.map(p => {
      if (typeof p === 'string') {
        // Entferne potenziell gefährliche Zeichen
        return p.replace(/[;\\"']/g, '');
      }
      return p;
    });
    return operation(...sanitized);
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
}

// Get all tables
router.get('/tables', (req, res) => {
  try {
    const tables = safeQuery(db.getTables.bind(db));
    res.json({ success: true, data: tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Get table by number
router.get('/tables/:number', (req, res) => {
  try {
    const tableNum = parseInt(req.params.number);
    
    // Validierung
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 12) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültige Tischnummer. Muss zwischen 1 und 12 liegen.' 
      });
    }
    
    const table = safeQuery(db.getTableByNumber.bind(db), tableNum);
    if (!table) {
      return res.status(404).json({ success: false, error: 'Tisch nicht gefunden' });
    }
    res.json({ success: true, data: table });
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Update table status
router.patch('/tables/:number/status', (req, res) => {
  try {
    const tableNum = parseInt(req.params.number);
    
    // Validierung Tischnummer
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 12) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültige Tischnummer' 
      });
    }
    
    // Zod-Validierung für Status
    const validation = validate(tableStatusSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültiger Status',
        details: validation.errors 
      });
    }
    
    const { status } = validation.data;
    const result = safeQuery(db.updateTableStatus.bind(db), tableNum, status);
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Tisch nicht gefunden' });
    }
    
    res.json({ success: true, message: 'Tischstatus aktualisiert' });
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Create new order
router.post('/orders', (req, res) => {
  try {
    // Zod-Validierung für Bestellung
    const validation = validate(orderSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültige Bestelldaten',
        details: validation.errors 
      });
    }
    
    const { tableNumber, items, total, tax, specialInstructions } = validation.data;
    
    // Prüfe ob Tisch existiert
    const table = safeQuery(db.getTableByNumber.bind(db), tableNumber);
    if (!table) {
      return res.status(404).json({ success: false, error: 'Tisch nicht gefunden' });
    }
    
    // Erstelle Bestellung (Prepared Statement Simulation)
    const order = safeQuery(db.createOrder.bind(db), {
      tableNumber,
      total,
      tax,
      specialInstructions: specialInstructions || null
    });
    
    // Füge Bestell-Items hinzu
    for (const item of items) {
      safeQuery(db.addOrderItem.bind(db), {
        orderId: order.id,
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        extras: JSON.stringify(item.extras || []),
        specialInstructions: item.specialInstructions || null
      });
    }
    
    // Aktualisiere Tischstatus
    safeQuery(db.updateTableStatus.bind(db), tableNumber, 'occupied');
    
    res.status(201).json({
      success: true,
      data: { orderId: order.id, tableNumber, status: 'pending' },
      message: 'Bestellung erfolgreich erstellt'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Get all orders
router.get('/orders', (req, res) => {
  try {
    const { status } = req.query;
    let orders = safeQuery(db.getOrders.bind(db));
    
    if (status) {
      // Validierung Status-Parameter
      const validStatuses = ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Ungültiger Status-Filter' 
        });
      }
      orders = orders.filter(o => o.status === status);
    }
    
    // Füge Items zu jeder Bestellung hinzu
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: safeQuery(db.getOrderItems.bind(db), order.id)
    }));
    
    res.json({ success: true, data: ordersWithItems });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Get order by ID
router.get('/orders/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId) || orderId < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültige Bestell-ID' 
      });
    }
    
    const order = safeQuery(db.getOrderById.bind(db), orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Bestellung nicht gefunden' });
    }
    
    const items = safeQuery(db.getOrderItems.bind(db), order.id);
    res.json({ success: true, data: { ...order, items } });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Update order status
router.patch('/orders/:id/status', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId) || orderId < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültige Bestell-ID' 
      });
    }
    
    // Zod-Validierung für Status
    const validation = validate(orderStatusSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültiger Status',
        details: validation.errors 
      });
    }
    
    const { status } = validation.data;
    const result = safeQuery(db.updateOrderStatus.bind(db), orderId, status);
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Bestellung nicht gefunden' });
    }
    
    res.json({ success: true, message: 'Bestellstatus aktualisiert' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Record QR scan
router.post('/qr-scan', (req, res) => {
  try {
    // Zod-Validierung
    const validation = validate(qrScanSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültige Scan-Daten',
        details: validation.errors 
      });
    }
    
    const { tableNumber, scanData } = validation.data;
    
    const scan = safeQuery(db.addQrScan.bind(db), {
      tableNumber,
      scanData: scanData || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.status(201).json({
      success: true,
      data: { scanId: scan.id, tableNumber },
      message: 'QR-Scan erfolgreich aufgezeichnet'
    });
  } catch (error) {
    console.error('Error recording QR scan:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Get QR scan history
router.get('/qr-scans', (req, res) => {
  try {
    const scans = safeQuery(db.getQrScans.bind(db));
    res.json({ success: true, data: scans });
  } catch (error) {
    console.error('Error fetching QR scans:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

// Get statistics
router.get('/stats', (req, res) => {
  try {
    const stats = safeQuery(db.getStats.bind(db));
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
});

module.exports = router;
