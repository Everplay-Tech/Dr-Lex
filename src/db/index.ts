import type { Database } from './types.js';

const USE_POSTGRES = !!process.env.DATABASE_URL;

console.log(USE_POSTGRES ? '🐘 Using PostgreSQL' : '💾 Using SQLite');

let dbInstance: Database;

if (USE_POSTGRES) {
  const { postgresDB } = await import('./postgres.js');
  dbInstance = postgresDB;
} else {
  const { sqliteDB } = await import('./sqlite.js');
  dbInstance = sqliteDB;
}

// Export clean interface
export const initDB = () => dbInstance.init();
export const userDB = dbInstance.users;
export const usageDB = dbInstance.usage;
