const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.SMARTCRM_DB_PATH || path.join(__dirname, '../../data/smartcrm.db');
const DATA_DIR = path.dirname(DB_PATH);

function ensureDbDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    ensureDbDir();
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      const schema = `
        CREATE TABLE IF NOT EXISTS service_centers (
          center_id INTEGER PRIMARY KEY,
          center_code TEXT NOT NULL UNIQUE,
          center_name TEXT NOT NULL,
          city TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS issue_categories (
          category_id INTEGER PRIMARY KEY,
          category_name TEXT NOT NULL,
          default_priority TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS technicians (
          technician_id INTEGER PRIMARY KEY,
          technician_code TEXT NOT NULL UNIQUE,
          ho_ten TEXT NOT NULL,
          center_id INTEGER NOT NULL,
          level TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (center_id) REFERENCES service_centers(center_id)
        );

        CREATE TABLE IF NOT EXISTS parts (
          part_id INTEGER PRIMARY KEY,
          part_code TEXT NOT NULL UNIQUE,
          part_name TEXT NOT NULL,
          unit_price INTEGER NOT NULL CHECK (unit_price >= 0)
        );

        CREATE TABLE IF NOT EXISTS part_stock (
          center_id INTEGER NOT NULL,
          part_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
          min_threshold INTEGER NOT NULL DEFAULT 0 CHECK (min_threshold >= 0),
          PRIMARY KEY (center_id, part_id),
          FOREIGN KEY (center_id) REFERENCES service_centers(center_id),
          FOREIGN KEY (part_id) REFERENCES parts(part_id)
        );

        CREATE TABLE IF NOT EXISTS part_transactions (
          transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
          center_id INTEGER NOT NULL,
          part_id INTEGER NOT NULL,
          transaction_type TEXT NOT NULL CHECK (transaction_type IN ('IN', 'OUT')),
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          ticket_code TEXT,
          FOREIGN KEY (center_id) REFERENCES service_centers(center_id),
          FOREIGN KEY (part_id) REFERENCES parts(part_id)
        );
      `;

      db.exec(schema, (execErr) => {
        if (execErr) {
          db.close();
          reject(execErr);
          return;
        }
        db.close();
        resolve();
      });
    });
  });
}

module.exports = { initDatabase, DB_PATH };
