const Database = require("better-sqlite3");

const db = new Database("fridge.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    expiry_date TEXT,
    added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

    module.exports =db;