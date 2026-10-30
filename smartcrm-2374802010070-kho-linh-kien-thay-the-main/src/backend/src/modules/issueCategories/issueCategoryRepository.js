const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../../../database/migrations/initDatabase');

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      resolve(db);
    });
  });
}

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    openDb().then((db) => {
      db.all(query, params, (error, rows) => {
        db.close((closeError) => {
          if (error) return reject(error);
          if (closeError) return reject(closeError);
          resolve(rows);
        });
      });
    }).catch(reject);
  });
}

function runMutation(query, params = []) {
  return new Promise((resolve, reject) => {
    openDb().then((db) => {
      db.run(query, params, function (error) {
        db.close((closeError) => {
          if (error) return reject(error);
          if (closeError) return reject(closeError);
          resolve({ changes: this.changes, lastID: this.lastID });
        });
      });
    }).catch(reject);
  });
}

async function findAll() {
  return runQuery('SELECT * FROM issue_categories ORDER BY category_id ASC');
}

async function findById(categoryId) {
  return runQuery('SELECT * FROM issue_categories WHERE category_id = ?', [categoryId]);
}

async function create({ categoryName, defaultPriority, isActive }) {
  const result = await runMutation(
    'INSERT INTO issue_categories (category_name, default_priority, is_active) VALUES (?, ?, ?)',
    [categoryName, defaultPriority, isActive]
  );
  const rows = await findById(result.lastID);
  return rows[0];
}

async function update(categoryId, { categoryName, defaultPriority, isActive }) {
  const result = await runMutation(
    'UPDATE issue_categories SET category_name = ?, default_priority = ?, is_active = ? WHERE category_id = ?',
    [categoryName, defaultPriority, isActive, categoryId]
  );
  if (!result.changes) return null;
  const rows = await findById(categoryId);
  return rows[0];
}

async function deleteById(categoryId) {
  const result = await runMutation('DELETE FROM issue_categories WHERE category_id = ?', [categoryId]);
  return result.changes > 0;
}

module.exports = { findAll, findById, create, update, deleteById };
