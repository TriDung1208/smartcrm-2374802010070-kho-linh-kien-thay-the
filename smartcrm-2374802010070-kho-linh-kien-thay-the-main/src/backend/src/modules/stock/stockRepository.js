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

async function getStockByCenterAndPart(centerId, partId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT s.center_id, s.part_id, p.part_code, p.part_name, s.quantity AS current_stock, s.min_threshold, (s.quantity < s.min_threshold) AS low_stock FROM part_stock s JOIN parts p ON p.part_id = s.part_id WHERE s.center_id = ? AND s.part_id = ?',
      [centerId, partId],
      (error, row) => {
        db.close();
        if (error) return reject(error);
        resolve(row || null);
      }
    );
  });
}

async function getAllStock(centerId = null) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const query = centerId ? 'SELECT s.center_id, s.part_id, p.part_code, p.part_name, s.quantity AS current_stock, s.min_threshold FROM part_stock s JOIN parts p ON p.part_id = s.part_id WHERE s.center_id = ? ORDER BY s.part_id' : 'SELECT s.center_id, s.part_id, p.part_code, p.part_name, s.quantity AS current_stock, s.min_threshold FROM part_stock s JOIN parts p ON p.part_id = s.part_id ORDER BY s.center_id, s.part_id';
    db.all(query, centerId ? [centerId] : [], (error, rows) => {
      db.close();
      if (error) return reject(error);
      resolve(rows);
    });
  });
}

async function getLowStock(centerId = null) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const query = centerId ? 'SELECT s.center_id, p.part_id, p.part_code, p.part_name, s.quantity AS current_stock, s.min_threshold FROM part_stock s JOIN parts p ON p.part_id = s.part_id WHERE s.center_id = ? AND s.quantity < s.min_threshold ORDER BY s.quantity ASC' : 'SELECT s.center_id, p.part_id, p.part_code, p.part_name, s.quantity AS current_stock, s.min_threshold FROM part_stock s JOIN parts p ON p.part_id = s.part_id WHERE s.quantity < s.min_threshold ORDER BY s.center_id, s.part_id';
    db.all(query, centerId ? [centerId] : [], (error, rows) => {
      db.close();
      if (error) return reject(error);
      resolve(rows);
    });
  });
}

async function upsertStock(centerId, partId, quantity, minThreshold = 0) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO part_stock (center_id, part_id, quantity, min_threshold)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(center_id, part_id)
       DO UPDATE SET quantity = excluded.quantity, min_threshold = excluded.min_threshold`,
      [centerId, partId, quantity, minThreshold],
      function (error) {
        db.close();
        if (error) return reject(error);
        resolve({ centerId, partId, quantity, minThreshold });
      }
    );
  });
}

async function createTransaction({ centerId, partId, transactionType, quantity, ticketCode }) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO part_transactions (center_id, part_id, transaction_type, quantity, ticket_code) VALUES (?, ?, ?, ?, ?)',
      [centerId, partId, transactionType, quantity, ticketCode || null],
      function (error) {
        db.close();
        if (error) return reject(error);
        resolve(this.lastID);
      }
    );
  });
}

async function getTransactions(centerId = null, type = null) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM part_transactions';
    const params = [];
    if (centerId || type) {
      query += ' WHERE';
      const clauses = [];
      if (centerId) clauses.push('center_id = ?');
      if (type) clauses.push('transaction_type = ?');
      query += ' ' + clauses.join(' AND ');
      params.push(...(centerId ? [centerId] : []), ...(type ? [type] : []));
    }
    query += ' ORDER BY transaction_id DESC';
    db.all(query, params, (error, rows) => {
      db.close();
      if (error) return reject(error);
      resolve(rows);
    });
  });
}

module.exports = {
  getStockByCenterAndPart,
  getAllStock,
  getLowStock,
  upsertStock,
  createTransaction,
  getTransactions
};
