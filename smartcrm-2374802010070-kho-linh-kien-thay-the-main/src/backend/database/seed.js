const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH, initDatabase } = require('./migrations/initDatabase');

const DATASET_DIR = path.join(__dirname, 'dataset');

function parseCsv(contents, fileName) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const text = contents.replace(/^\uFEFF/, '');

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      field = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error(`CSV có dấu ngoặc kép chưa đóng: ${fileName}`);
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== '')) rows.push(row);
  }
  if (rows.length === 0) throw new Error(`CSV không có tiêu đề: ${fileName}`);

  const [headers, ...records] = rows;
  if (new Set(headers).size !== headers.length || headers.some((header) => !header)) {
    throw new Error(`Tiêu đề CSV không hợp lệ: ${fileName}`);
  }

  return records.map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`CSV sai số cột tại dòng ${index + 2}: ${fileName}`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, values[column]]));
  });
}

function readCsv(fileName) {
  return parseCsv(fs.readFileSync(path.join(DATASET_DIR, fileName), 'utf8'), fileName);
}

function integer(value, field, fileName) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Giá trị ${field} không phải số nguyên hợp lệ trong ${fileName}.`);
  }
  return parsed;
}

function booleanInteger(value, field, fileName) {
  if (value === 'true' || value === '1') return 1;
  if (value === 'false' || value === '0') return 0;
  throw new Error(`Giá trị ${field} không hợp lệ trong ${fileName}.`);
}

function getDataset() {
  return [
    {
      table: 'service_centers',
      columns: ['center_id', 'center_code', 'center_name', 'city'],
      rows: readCsv('service_centers.csv').map((row) => ({
        center_id: integer(row.center_id, 'center_id', 'service_centers.csv'),
        center_code: row.center_code,
        center_name: row.center_name,
        city: row.thanh_pho
      }))
    },
    {
      table: 'issue_categories',
      columns: ['category_id', 'category_name', 'default_priority', 'is_active'],
      rows: readCsv('issue_categories.csv').map((row) => ({
        category_id: integer(row.category_id, 'category_id', 'issue_categories.csv'),
        category_name: row.category_name,
        default_priority: row.default_priority,
        is_active: booleanInteger(row.is_active, 'is_active', 'issue_categories.csv')
      }))
    },
    {
      table: 'technicians',
      columns: ['technician_id', 'technician_code', 'ho_ten', 'center_id', 'level', 'is_active'],
      rows: readCsv('technicians.csv').map((row) => ({
        technician_id: integer(row.technician_id, 'technician_id', 'technicians.csv'),
        technician_code: row.technician_code,
        ho_ten: row.ho_ten,
        center_id: integer(row.center_id, 'center_id', 'technicians.csv'),
        level: row.level,
        is_active: booleanInteger(row.is_active, 'is_active', 'technicians.csv')
      }))
    },
    {
      table: 'parts',
      columns: ['part_id', 'part_code', 'part_name', 'unit_price'],
      rows: readCsv('parts.csv').map((row) => ({
        part_id: integer(row.part_id, 'part_id', 'parts.csv'),
        part_code: row.part_code,
        part_name: row.part_name,
        unit_price: integer(row.unit_price, 'unit_price', 'parts.csv')
      }))
    },
    {
      table: 'part_stock',
      columns: ['center_id', 'part_id', 'quantity', 'min_threshold'],
      rows: readCsv('part_stock.csv').map((row) => ({
        center_id: integer(row.center_id, 'center_id', 'part_stock.csv'),
        part_id: integer(row.part_id, 'part_id', 'part_stock.csv'),
        quantity: integer(row.quantity, 'quantity', 'part_stock.csv'),
        min_threshold: integer(row.min_threshold, 'min_threshold', 'part_stock.csv')
      }))
    },
    {
      table: 'part_transactions',
      columns: ['transaction_id', 'center_id', 'part_id', 'transaction_type', 'quantity', 'created_at', 'ticket_code'],
      rows: readCsv('part_transactions.csv').map((row) => {
        const transactionType = { NHAP: 'IN', XUAT: 'OUT' }[row.loai];
        if (!transactionType) throw new Error(`Loại giao dịch không hợp lệ trong part_transactions.csv: ${row.loai}`);
        return {
          transaction_id: integer(row.transaction_id, 'transaction_id', 'part_transactions.csv'),
          center_id: integer(row.center_id, 'center_id', 'part_transactions.csv'),
          part_id: integer(row.part_id, 'part_id', 'part_transactions.csv'),
          transaction_type: transactionType,
          quantity: integer(row.so_luong, 'so_luong', 'part_transactions.csv'),
          created_at: row.ngay,
          ticket_code: row.ticket_code || null
        };
      })
    }
  ];
}

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (error) => {
      if (error) return reject(error);
      resolve(db);
    });
  });
}

function run(db, query) {
  return new Promise((resolve, reject) => {
    db.run(query, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

function insertRows(db, { table, columns, rows }, ignoreConflicts) {
  if (rows.length === 0) return Promise.resolve();
  const placeholders = columns.map(() => '?').join(', ');
  const conflictMode = ignoreConflicts ? 'OR IGNORE ' : '';
  const statement = db.prepare(
    `INSERT ${conflictMode}INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
  );

  return new Promise((resolve, reject) => {
    let index = 0;
    const finish = (error) => {
      statement.finalize((finalizeError) => {
        if (error) return reject(error);
        if (finalizeError) return reject(finalizeError);
        resolve();
      });
    };
    const insertNext = () => {
      if (index >= rows.length) return finish();
      const row = rows[index];
      index += 1;
      statement.run(columns.map((column) => row[column]), (error) => {
        if (error) return finish(error);
        insertNext();
      });
    };
    insertNext();
  });
}

async function seedCatalogData() {
  const dataset = getDataset();
  const db = await openDb();
  try {
    await run(db, 'BEGIN IMMEDIATE');
    for (const table of dataset) await insertRows(db, table, true);
    await run(db, 'COMMIT');
  } catch (error) {
    try {
      await run(db, 'ROLLBACK');
    } catch (rollbackError) {
      error.rollbackError = rollbackError;
    }
    throw error;
  } finally {
    await new Promise((resolve, reject) => {
      db.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function replaceCatalogData() {
  const dataset = getDataset();
  const db = await openDb();
  try {
    await run(db, 'PRAGMA foreign_keys = ON');
    await run(db, 'BEGIN IMMEDIATE');
    for (const table of ['part_transactions', 'part_stock', 'technicians', 'parts', 'issue_categories', 'service_centers']) {
      await run(db, `DELETE FROM ${table}`);
    }
    for (const table of dataset) await insertRows(db, table, false);
    await run(db, 'COMMIT');
  } catch (error) {
    try {
      await run(db, 'ROLLBACK');
    } catch (rollbackError) {
      error.rollbackError = rollbackError;
    }
    throw error;
  } finally {
    await new Promise((resolve, reject) => {
      db.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

module.exports = { replaceCatalogData, seedCatalogData };

if (require.main === module) {
  initDatabase()
    .then(replaceCatalogData)
    .then(() => console.log(`Dataset imported at ${DB_PATH}; user accounts were preserved.`))
    .catch((error) => {
      console.error('Dataset import failed:', error);
      process.exitCode = 1;
    });
}
