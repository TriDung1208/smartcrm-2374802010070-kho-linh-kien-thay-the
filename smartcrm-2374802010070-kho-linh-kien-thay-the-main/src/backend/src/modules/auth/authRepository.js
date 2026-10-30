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
      'SELECT user_id, username, password_hash, password_salt FROM users WHERE username = ?',
      [username],
      (error, user) => {
        db.close();
        if (error) return reject(error);
        resolve(user || null);
      }
    );
  });
}

async function createUser({ username, passwordHash, passwordSalt }) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)',
      [username, passwordHash, passwordSalt],
      function (error) {
        db.close();
        if (error) return reject(error);
        resolve({ userId: this.lastID, username });
      }
    );
  });
}

module.exports = { getUserByUsername, createUser };
