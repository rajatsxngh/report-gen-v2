const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'reportgen.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS template_elements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    label TEXT,
    config TEXT DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS datasets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    dataset_id INTEGER NOT NULL,
    frequency TEXT NOT NULL,
    time TEXT NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    next_run TEXT,
    email TEXT,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS run_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER,
    template_id INTEGER NOT NULL,
    dataset_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    pdf_path TEXT,
    error TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
  );
`);

// Seed mock datasets if none exist
const count = db.prepare('SELECT COUNT(*) as count FROM datasets').get();

if (count.count === 0) {
  const insertDataset = db.prepare(
    'INSERT INTO datasets (name, description, category, data) VALUES (?, ?, ?, ?)'
  );

  // 1. Sales data — 12+ months across 3 regions
  const salesData = [];
  const regions = ['North', 'South', 'West'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  for (const month of months) {
    for (const region of regions) {
      salesData.push({
        month,
        region,
        revenue: Math.round(50000 + Math.random() * 100000),
        units: Math.round(200 + Math.random() * 800),
        profit: Math.round(10000 + Math.random() * 40000),
      });
    }
  }
  insertDataset.run(
    'Sales Data',
    'Monthly sales figures across 3 regions (North, South, West) for 12 months',
    'Sales',
    JSON.stringify(salesData)
  );

  // 2. User metrics — 30+ days
  const userMetrics = [];
  for (let day = 1; day <= 31; day++) {
    userMetrics.push({
      date: `2025-01-${String(day).padStart(2, '0')}`,
      activeUsers: Math.round(1000 + Math.random() * 5000),
      newSignups: Math.round(50 + Math.random() * 200),
      sessionsPerUser: +(1 + Math.random() * 4).toFixed(1),
      avgSessionDuration: Math.round(120 + Math.random() * 600),
    });
  }
  insertDataset.run(
    'User Metrics',
    'Daily user engagement metrics over 31 days',
    'Analytics',
    JSON.stringify(userMetrics)
  );

  // 3. Inventory — 20+ products
  const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'];
  const inventoryData = [];
  for (let i = 1; i <= 22; i++) {
    inventoryData.push({
      productId: `PRD-${String(i).padStart(3, '0')}`,
      name: `Product ${i}`,
      category: categories[i % categories.length],
      stock: Math.round(Math.random() * 500),
      price: +(5 + Math.random() * 200).toFixed(2),
      reorderLevel: Math.round(10 + Math.random() * 50),
    });
  }
  insertDataset.run(
    'Inventory',
    'Product inventory with 22 items across 5 categories',
    'Inventory',
    JSON.stringify(inventoryData)
  );
}

module.exports = db;
