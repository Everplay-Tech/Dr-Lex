// Use PostgreSQL in production, SQLite locally
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  console.log('Using PostgreSQL');
  const pg = await import('./postgres.js');
  export const initDB = pg.initDB;
  export const userDB = pg.userDB;
  export const usageDB = pg.usageDB;
  export const db = pg.db;
} else {
  console.log('Using SQLite (local dev)');
  const sqlite = await import('./sqlite.js');
  export const initDB = sqlite.initDB;
  export const userDB = sqlite.userDB;
  export const usageDB = sqlite.usageDB;
  export const db = sqlite.db;
}
