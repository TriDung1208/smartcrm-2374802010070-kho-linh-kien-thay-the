const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smartcrm-auth-migration-'));
const dbPath = path.join(tempDir, 'legacy.db');
process.env.SMARTCRM_DB_PATH = dbPath;

const sqlite3 = require('sqlite3').verbose();
const { initDatabase } = require('../../../database/migrations/initDatabase');

function runSql(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(query, params, (error) => {
      db.close((closeError) => {
        if (error) return reject(error);
        if (closeError) return reject(closeError);
        resolve();
      });
    });
  });
}

function getUserRole() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.get('SELECT role FROM users WHERE username = ?', ['legacy.user'], (error, row) => {
      db.close((closeError) => {
        if (error) return reject(error);
        if (closeError) return reject(closeError);
        resolve(row?.role);
      });
    });
  });
}

test('migration adds a default warehouse role to existing user tables', async () => {
  await runSql(`CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await runSql(
    'INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)',
    ['legacy.user', 'hash', 'salt']
  );

  await initDatabase();

  assert.equal(await getUserRole(), 'WAREHOUSE');
});

test.after(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});
