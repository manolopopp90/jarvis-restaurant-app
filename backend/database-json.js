const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || '/app/data/seeblick.json';
console.log('📁 Database path:', dbPath);

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize data
let data = {
  tables: [],
  orders: [],
  orderItems: [],
  qrScans: []
};

// Load existing data
if (fs.existsSync(dbPath)) {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    data = JSON.parse(raw);
    console.log('✅ Loaded existing database');
  } catch (error) {
    console.error('❌ Error loading database:', error.message);
  }
}

// Initialize default tables
if (data.tables.length === 0) {
  for (let i = 1; i <= 12; i++) {
    data.tables.push({
      id: i,
      tableNumber: i,
      status: 'available',
      seats: i <= 4 ? 2 : i <= 8 ? 4 : 6,
      createdAt: new Date().toISOString()
    });
  }
  console.log('✅ Default tables inserted');
  saveData();
}

function saveData() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Database operations
class Database {
  constructor() {
    this.data = data;
  }

  // Tables
  getTables() {
    return this.data.tables;
  }

  getTableByNumber(number) {
    return this.data.tables.find(t => t.tableNumber === number);
  }

  updateTableStatus(number, status) {
    const table = this.getTableByNumber(number);
    if (table) {
      table.status = status;
      saveData();
      return true;
    }
    return false;
  }

  // Orders
  getOrders() {
    return this.data.orders;
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(order) {
    const newOrder = {
      id: Date.now(),
      ...order,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.orders.push(newOrder);
    saveData();
    return newOrder;
  }

  updateOrderStatus(id, status) {
    const order = this.getOrderById(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      saveData();
      return true;
    }
    return false;
  }

  // Order Items
  getOrderItems(orderId) {
    return this.data.orderItems.filter(item => item.orderId === orderId);
  }

  addOrderItem(item) {
    const newItem = {
      id: Date.now(),
      ...item,
      createdAt: new Date().toISOString()
    };
    this.data.orderItems.push(newItem);
    saveData();
    return newItem;
  }

  // QR Scans
  getQrScans() {
    return this.data.qrScans;
  }

  addQrScan(scan) {
    const newScan = {
      id: Date.now(),
      ...scan,
      createdAt: new Date().toISOString()
    };
    this.data.qrScans.push(newScan);
    saveData();
    return newScan;
  }

  // Stats
  getStats() {
    return {
      tables: {
        total: this.data.tables.length,
        occupied: this.data.tables.filter(t => t.status === 'occupied').length,
        available: this.data.tables.filter(t => t.status === 'available').length
      },
      orders: {
        total: this.data.orders.length,
        today: this.data.orders.filter(o => {
          const orderDate = new Date(o.createdAt).toDateString();
          const today = new Date().toDateString();
          return orderDate === today;
        }).length,
        pending: this.data.orders.filter(o => o.status === 'pending').length
      },
      revenue: {
        total: this.data.orders
          .filter(o => o.status === 'paid')
          .reduce((sum, o) => sum + (o.total || 0), 0),
        today: this.data.orders
          .filter(o => {
            const orderDate = new Date(o.createdAt).toDateString();
            const today = new Date().toDateString();
            return orderDate === today && o.status === 'paid';
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
      }
    };
  }
}

const database = new Database();
console.log('✅ Database initialized');

module.exports = database;