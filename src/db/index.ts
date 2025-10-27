import * as sqlite from './sqlite.js';

const usePostgres = !!process.env.DATABASE_URL;

console.log(usePostgres ? 'Using PostgreSQL (will initialize on first use)' : 'Using SQLite');

// Lazy-load PostgreSQL only when actually used
let postgresModule: any = null;

async function getPostgres() {
  if (!postgresModule) {
    postgresModule = await import('./postgres.js');
  }
  return postgresModule;
}

export async function initDB() {
  if (usePostgres) {
    const pg = await getPostgres();
    return pg.initDB();
  }
  return sqlite.initDB();
}

export const userDB = {
  create: async (user: any) => {
    if (usePostgres) {
      const pg = await getPostgres();
      return pg.userDB.create(user);
    }
    return sqlite.userDB.create(user);
  },
  findByEmail: async (email: string) => {
    if (usePostgres) {
      const pg = await getPostgres();
      return pg.userDB.findByEmail(email);
    }
    return sqlite.userDB.findByEmail(email);
  },
  findById: async (id: string) => {
    if (usePostgres) {
      const pg = await getPostgres();
      return pg.userDB.findById(id);
    }
    return sqlite.userDB.findById(id);
  },
  findByApiKey: async (key: string) => {
    if (usePostgres) {
      const pg = await getPostgres();
      return pg.userDB.findByApiKey(key);
    }
    return sqlite.userDB.findByApiKey(key);
  },
};

export const usageDB = {
  record: async (userId: string, missionId: string, botType: string, energy: number) => {
    if (usePostgres) {
      const pg = await getPostgres();
      return pg.usageDB.record(userId, missionId, botType, energy);
    }
    return sqlite.usageDB.record(userId, missionId, botType, energy);
  },
  getUsage: async (userId: string, after?: string) => {
    if (usePostgres) {
      const pg = await getPostgres();
      return pg.usageDB.getUsage(userId, after);
    }
    return sqlite.usageDB.getUsage(userId, after);
  },
};

export const db = sqlite.db; // For now, return sqlite's db object
