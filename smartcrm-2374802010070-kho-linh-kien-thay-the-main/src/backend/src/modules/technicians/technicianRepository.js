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
  return runQuery('SELECT * FROM technicians ORDER BY technician_id ASC');
}

async function findById(technicianId) {
  return runQuery('SELECT * FROM technicians WHERE technician_id = ?', [technicianId]);
}

async function findByCenter(centerId) {
  return runQuery('SELECT * FROM technicians WHERE center_id = ? ORDER BY technician_id ASC', [centerId]);
}

module.exports = { findAll, findById, findByCenter };
