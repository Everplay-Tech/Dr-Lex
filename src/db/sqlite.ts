import Database from "better-sqlite3";
import type { Database as DatabaseInterface, User, Usage } from './types.js';

const db = new Database("dr-lex.db");

const users = {
  async create(user: Omit<User, 'created_at'>) {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, plan, api_key)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(user.id, user.email, user.password_hash, user.name, user.plan || 'free', user.api_key);
  },

  async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User || null;
  },

  async findById(id: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User || null;
  },

  async findByApiKey(apiKey: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE api_key = ?');
    return stmt.get(apiKey) as User || null;
  }
};

const usage = {
  async record(userId: string, missionId: string, botType: string, energyUsed: number) {
    const stmt = db.prepare(`
      INSERT INTO usage (user_id, mission_id, bot_type, energy_used, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(userId, missionId, botType, energyUsed);
  },

  async getUsage(userId: string, after?: string): Promise<Usage[]> {
    if (after) {
      const stmt = db.prepare(`
        SELECT * FROM usage 
        WHERE user_id = ? AND timestamp >= ?
        ORDER BY timestamp DESC
      `);
      return stmt.all(userId, after) as Usage[];
    }
    const stmt = db.prepare(`
      SELECT * FROM usage 
      WHERE user_id = ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(userId) as Usage[];
  }
};

async function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'free',
      api_key TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      mission_id TEXT NOT NULL,
      bot_type TEXT NOT NULL,
      energy_used INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('SQLite initialized');
}

export const sqliteDB: DatabaseInterface = {
  init,
  users,
  usage
};
