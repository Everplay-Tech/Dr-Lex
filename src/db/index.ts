import * as sqlite from './sqlite.js';
import * as postgres from './postgres.js';

const usePostgres = !!process.env.DATABASE_URL;

console.log(usePostgres ? 'Using PostgreSQL' : 'Using SQLite');

// Wrapper functions that choose the right DB at runtime
export const initDB = () => {
  return usePostgres ? postgres.initDB() : sqlite.initDB();
};

export const userDB = {
  create: (user: any) => usePostgres ? postgres.userDB.create(user) : sqlite.userDB.create(user),
  findByEmail: (email: string) => usePostgres ? postgres.userDB.findByEmail(email) : sqlite.userDB.findByEmail(email),
  findById: (id: string) => usePostgres ? postgres.userDB.findById(id) : sqlite.userDB.findById(id),
  findByApiKey: (key: string) => usePostgres ? postgres.userDB.findByApiKey(key) : sqlite.userDB.findByApiKey(key),
};

export const usageDB = {
  record: (userId: string, missionId: string, botType: string, energy: number) => 
    usePostgres ? postgres.usageDB.record(userId, missionId, botType, energy) : sqlite.usageDB.record(userId, missionId, botType, energy),
  getUsage: (userId: string, after?: string) => 
    usePostgres ? postgres.usageDB.getUsage(userId, after) : sqlite.usageDB.getUsage(userId, after),
};

export const db = usePostgres ? postgres.db : sqlite.db;
