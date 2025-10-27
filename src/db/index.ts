// Auto-detect: Use PostgreSQL if DATABASE_URL exists, otherwise SQLite
const usePostgres = !!process.env.DATABASE_URL;

let initDB: any;
let userDB: any;
let usageDB: any;
let db: any;

if (usePostgres) {
  console.log('Using PostgreSQL');
  const pg = require('./postgres.js');
  initDB = pg.initDB;
  userDB = pg.userDB;
  usageDB = pg.usageDB;
  db = pg.db;
} else {
  console.log('Using SQLite (local dev)');
  const sqlite = require('./sqlite.js');
  initDB = sqlite.initDB;
  userDB = sqlite.userDB;
  usageDB = sqlite.usageDB;
  db = sqlite.db;
}

export { initDB, userDB, usageDB, db };
