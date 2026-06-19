
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'problems.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    severity INTEGER NOT NULL,
    time_spent_minutes INTEGER NOT NULL,
    tags TEXT,
    date TEXT NOT NULL,
    resolved INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
