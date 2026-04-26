const express = require('express');
const router = express.Router();
const db = require('./database-json');

// Get all tables
router.get('/tables', (req, res) => {
  try {
    const tables = db.getTables();
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get table by number
router.get('/tables/:number', (req, res) => {
  try {
    const table = db.getTableByNumber(parseInt(req.params.number));
    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update table status
router.patch('/tables/:number/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const result = db.updateTableStatus(parseInt(req.params.number), status);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }
    res.json({ success: true, message: 'Table status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new order
router.post('/orders', (req, res) => {
  try {
    const { tableNumber, items, total, tax, specialInstructions } = req.body;

    // Validate table exists
    const table = db.getTableByNumber(tableNumber);
    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    // Create order
    const order = db.createOrder({
      tableNumber,
      total,
      tax,
      specialInstructions: specialInstructions || null
    });

    // Add order items
    for (const item of items) {
      db.addOrderItem({
        orderId: order.id,
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        extras: JSON.stringify(item.extras || []),
        specialInstructions: item.specialInstructions || null
      });
    }

    // Update table status to occupied
    db.updateTableStatus(tableNumber, 'occupied');

    res.status(201).json({
      success: true,
      data: { orderId: order.id, tableNumber, status: 'pending' },
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all orders
router.get('/orders', (req, res) => {
  try {
    const { status } = req.query;
    let orders = db.getOrders();

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    // Add items to each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: db.getOrderItems(order.id)
    }));

    res.json({ success: true, data: ordersWithItems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get order by ID
router.get('/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(parseInt(req.params.id));
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = db.getOrderItems(order.id);
    res.json({ success: true, data: { ...order, items } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const result = db.updateOrderStatus(parseInt(req.params.id), status);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record QR scan
router.post('/qr-scan', (req, res) => {
  try {
    const { tableNumber, scanData } = req.body;

    const scan = db.addQrScan({
      tableNumber,
      scanData: scanData || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });

    res.status(201).json({
      success: true,
      data: { scanId: scan.id, tableNumber },
      message: 'QR scan recorded'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get QR scan history
router.get('/qr-scans', (req, res) => {
  try {
    const scans = db.getQrScans();
    res.json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get statistics
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;