import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('data/drlex.db');
const SCHEMA_PATH = path.resolve('src/db/schema.sql');

export const db = new Database(DB_PATH);

// Initialize database
export function initDB() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  console.log('Database initialized');
}

// User operations
export const userDB = {
  create: (user: { id: string; email: string; password_hash: string; name?: string; api_key: string }) => {
    const stmt = db.prepare('INSERT INTO users (id, email, password_hash, name, plan, created_at, api_key) VALUES (?, ?, ?, ?, ?, ?, ?)');
    return stmt.run(user.id, user.email, user.password_hash, user.name || null, 'free', new Date().toISOString(), user.api_key);
  },
  
  findByEmail: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },
  
  findByApiKey: (apiKey: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE api_key = ?');
    return stmt.get(apiKey);
  },
  
  findById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }
};

// Usage tracking
export const usageDB = {
  record: (userId: string, missionId: string, botType: string, energyUsed: number) => {
    const stmt = db.prepare('INSERT INTO usage (id, user_id, mission_id, bot_type, energy_used, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
    const id = Math.random().toString(36).substring(7);
    return stmt.run(id, userId, missionId, botType, energyUsed, new Date().toISOString());
  },
  
  getUsage: (userId: string, since?: string) => {
    const stmt = since 
      ? db.prepare('SELECT * FROM usage WHERE user_id = ? AND timestamp > ? ORDER BY timestamp DESC')
      : db.prepare('SELECT * FROM usage WHERE user_id = ? ORDER BY timestamp DESC');
    return since ? stmt.all(userId, since) : stmt.all(userId);
  }
};
