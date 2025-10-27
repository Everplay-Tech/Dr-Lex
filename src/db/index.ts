import * as sqlite from './sqlite.js';
import * as postgres from './postgres.js';

const usePostgres = !!process.env.DATABASE_URL;

console.log(usePostgres ? 'Using PostgreSQL' : 'Using SQLite (local dev)');

export const initDB = usePostgres ? postgres.initDB : sqlite.initDB;
export const userDB = usePostgres ? postgres.userDB : sqlite.userDB;
export const usageDB = usePostgres ? postgres.usageDB : sqlite.usageDB;
export const db = usePostgres ? postgres.db : sqlite.db;
