const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use absolute path for database
const dbPath = process.env.DB_PATH || path.resolve('/app/data', 'seeblick.db');
console.log('📁 Database path:', dbPath);

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create tables and initialize
db.serialize(() => {
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL UNIQUE,
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'reserved', 'cleaning')),
      seats INTEGER DEFAULT 4,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
      total REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      special_instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_number) REFERENCES tables(table_number)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      extras TEXT,
      special_instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS qr_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL,
      scan_data TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_qr_scans_table ON qr_scans(table_number)`);

  // Check if tables exist
  db.get('SELECT COUNT(*) as count FROM tables', (err, row) => {
    if (err) {
      console.error('❌ Error checking tables:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO tables (table_number, seats) VALUES (?, ?)');
      for (let i = 1; i <= 12; i++) {
        stmt.run(i, i <= 4 ? 2 : i <= 8 ? 4 : 6);
      }
      stmt.finalize();
      console.log('✅ Default tables inserted');
    }
    
    console.log('✅ Database initialized successfully');
  });
});

module.exports = db;