const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../../../database/migrations/initDatabase');

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (error) => {
      if (error) return reject(error);
      resolve(db);
    });
  });
}

async function getUserByUsername(username) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT user_id, username, password_hash, password_salt, role FROM users WHERE username = ?',
      [username],
      (error, user) => {
        db.close((closeError) => {
          if (error) return reject(error);
          if (closeError) return reject(closeError);
          resolve(user || null);
        });
      }
    );
  });
}

async function getUserById(userId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT user_id, username, role FROM users WHERE user_id = ?',
      [userId],
      (error, user) => {
        db.close((closeError) => {
          if (error) return reject(error);
          if (closeError) return reject(closeError);
          resolve(user || null);
        });
      }
    );
  });
}

async function createUser({ username, passwordHash, passwordSalt }) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password_hash, password_salt, role) VALUES (?, ?, ?, 'WAREHOUSE')",
      [username, passwordHash, passwordSalt],
      function (error) {
        db.close((closeError) => {
          if (error) return reject(error);
          if (closeError) return reject(closeError);
          resolve({ userId: this.lastID, username, role: 'WAREHOUSE' });
        });
      }
    );
  });
}

async function setUserRole(username, role) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET role = ? WHERE username = ?',
      [role, username],
      function (error) {
        db.close((closeError) => {
          if (error) return reject(error);
          if (closeError) return reject(closeError);
          resolve(this.changes > 0);
        });
      }
    );
  });
}

module.exports = { getUserByUsername, getUserById, createUser, setUserRole };
