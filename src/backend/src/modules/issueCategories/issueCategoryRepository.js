const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../../../database/migrations/initDatabase');

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
    });

    db.all(query, params, (error, rows) => {
      db.close();
      if (error) return reject(error);
      resolve(rows);
    });
  });
}

async function findAll() {
  return runQuery('SELECT * FROM issue_categories ORDER BY category_id ASC');
}

async function findById(categoryId) {
  return runQuery('SELECT * FROM issue_categories WHERE category_id = ?', [categoryId]);
}

module.exports = { findAll, findById };
