import type { Database } from './types.js';

const USE_POSTGRES = !!process.env.DATABASE_URL;

console.log(USE_POSTGRES ? '🐘 Using PostgreSQL' : '💾 Using SQLite');

let db: Database;

if (USE_POSTGRES) {
  const { postgresDB } = await import('./postgres.js');
  db = postgresDB;
} else {
  const { sqliteDB } = await import('./sqlite.js');
  db = sqliteDB;
}

// Export clean interface
export const initDB = () => db.init();
export const userDB = db.users;
export const usageDB = db.usage;
