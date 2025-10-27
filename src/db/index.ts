import type { Database } from './types.js';

const USE_POSTGRES = !!process.env.DATABASE_URL;

console.log(USE_POSTGRES ? '🐘 Using PostgreSQL' : '💾 Using SQLite');

let dbInstance: Database;

if (USE_POSTGRES) {
  console.log('Importing postgres module...');
  const pgModule = await import('./postgres.js');
  console.log('Postgres module:', pgModule);
  dbInstance = pgModule.postgresDB;
  console.log('dbInstance set to:', dbInstance);
} else {
  console.log('Importing sqlite module...');
  const sqliteModule = await import('./sqlite.js');
  console.log('SQLite module:', sqliteModule);
  console.log('sqliteDB from module:', sqliteModule.sqliteDB);
  dbInstance = sqliteModule.sqliteDB;
  console.log('dbInstance set to:', dbInstance);
}

console.log('Final dbInstance:', dbInstance);
console.log('dbInstance.users:', dbInstance?.users);

// Export clean interface
export const initDB = () => dbInstance.init();
export const userDB = dbInstance.users;
export const usageDB = dbInstance.usage;
