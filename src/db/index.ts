const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  console.log('Using PostgreSQL');
  // Dynamic import for PostgreSQL
  const postgres = await import('./postgres.js');
  export const initDB = postgres.initDB;
  export const userDB = postgres.userDB;
  export const usageDB = postgres.usageDB;
  export const db = postgres.db;
} else {
  console.log('Using SQLite');
  const sqlite = await import('./sqlite.js');
  export const initDB = sqlite.initDB;
  export const userDB = sqlite.userDB;
  export const usageDB = sqlite.usageDB;
  export const db = sqlite.db;
}
