import postgres from 'postgres';
import type { Database, User, Usage } from './types.js';

// Create connection with Railway-optimized settings
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'prefer', // Changed from 'require' to 'prefer'
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false, // Disable prepared statements for compatibility
});

const users = {
  async create(user: Omit<User, 'created_at'>) {
    await sql`
      INSERT INTO users ${sql(user)}
    `;
  },

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return user || null;
  },

  async findById(id: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return user || null;
  },

  async findByApiKey(apiKey: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE api_key = ${apiKey} LIMIT 1
    `;
    return user || null;
  }
};

const usage = {
  async record(userId: string, missionId: string, botType: string, energyUsed: number) {
    await sql`
      INSERT INTO usage (user_id, mission_id, bot_type, energy_used)
      VALUES (${userId}, ${missionId}, ${botType}, ${energyUsed})
    `;
  },

  async getUsage(userId: string, after?: string): Promise<Usage[]> {
    if (after) {
      return await sql<Usage[]>`
        SELECT * FROM usage 
        WHERE user_id = ${userId} AND timestamp >= ${after}
        ORDER BY timestamp DESC
      `;
    }
    return await sql<Usage[]>`
      SELECT * FROM usage 
      WHERE user_id = ${userId}
      ORDER BY timestamp DESC
    `;
  }
};

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'free',
      api_key TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS usage (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      mission_id TEXT NOT NULL,
      bot_type TEXT NOT NULL,
      energy_used INTEGER NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('PostgreSQL initialized');
}

export const postgresDB: Database = {
  init,
  users,
  usage
};
