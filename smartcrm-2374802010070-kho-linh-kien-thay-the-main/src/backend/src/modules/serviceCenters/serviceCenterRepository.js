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
  return runQuery('SELECT * FROM service_centers ORDER BY center_id ASC');
}

async function findById(centerId) {
  return runQuery('SELECT * FROM service_centers WHERE center_id = ?', [centerId]);
}

async function create({ centerCode, centerName, city }) {
  const result = await runMutation(
    'INSERT INTO service_centers (center_code, center_name, city) VALUES (?, ?, ?)',
    [centerCode, centerName, city]
  );
  const rows = await findById(result.lastID);
  return rows[0];
}

async function update(centerId, { centerCode, centerName, city }) {
  const result = await runMutation(
    'UPDATE service_centers SET center_code = ?, center_name = ?, city = ? WHERE center_id = ?',
    [centerCode, centerName, city, centerId]
  );
  if (!result.changes) return null;
  const rows = await findById(centerId);
  return rows[0];
}

async function deleteById(centerId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const closeWith = (error, result) => {
      db.close((closeError) => {
        if (error) return reject(error);
        if (closeError) return reject(closeError);
        resolve(result);
      });
    };
    const rollback = (error, result) => {
      db.run('ROLLBACK', (rollbackError) => {
        closeWith(error || rollbackError, result);
      });
    };

    db.run('BEGIN IMMEDIATE', (beginError) => {
      if (beginError) return closeWith(beginError);
      db.get(
        `SELECT
          (SELECT COUNT(*) FROM technicians WHERE center_id = ?) AS technician_count,
          (SELECT COUNT(*) FROM part_stock WHERE center_id = ?) AS stock_count,
          (SELECT COUNT(*) FROM part_transactions WHERE center_id = ?) AS transaction_count`,
        [centerId, centerId, centerId],
        (usageError, usage) => {
          if (usageError) return rollback(usageError);
          if (usage.technician_count || usage.stock_count || usage.transaction_count) {
            const error = new Error('Không thể xóa trung tâm đang được tham chiếu bởi kỹ thuật viên hoặc giao dịch kho.');
            error.statusCode = 409;
            error.code = 'SERVICE_CENTER_IN_USE';
            return rollback(error);
          }
          db.run('DELETE FROM service_centers WHERE center_id = ?', [centerId], function (deleteError) {
            if (deleteError) return rollback(deleteError);
            if (!this.changes) return rollback(null, false);
            db.run('COMMIT', (commitError) => {
              if (commitError) return rollback(commitError);
              closeWith(null, true);
            });
          });
        }
      );
    });
  });
}

module.exports = { findAll, findById, create, update, deleteById };
