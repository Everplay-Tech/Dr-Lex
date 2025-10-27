import * as sqlite from './sqlite.js';

const usePostgres = !!process.env.DATABASE_URL;

let postgres: any = null;

if (usePostgres) {
  console.log('Using PostgreSQL');
  postgres = await import('./postgres.js');
} else {
  console.log('Using SQLite');
}

export const initDB = usePostgres ? postgres.initDB : sqlite.initDB;
export const userDB = usePostgres ? postgres.userDB : sqlite.userDB;
export const usageDB = usePostgres ? postgres.usageDB : sqlite.usageDB;
export const db = usePostgres ? postgres.db : sqlite.db;
