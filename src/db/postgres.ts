import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'free',
      api_key TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS usage (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      mission_id TEXT NOT NULL,
      bot_type TEXT NOT NULL,
      energy_used INTEGER NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log('Database initialized');
}

export const userDB = {
  create: async (user: any) => {
    const { id, email, password_hash, name, api_key } = user;
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, api_key) VALUES ($1, $2, $3, $4, $5)',
      [id, email, password_hash, name, api_key]
    );
  },
  
  findByEmail: async (email: string) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },
  
  findById: async (id: string) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },
  
  findByApiKey: async (apiKey: string) => {
    const result = await pool.query('SELECT * FROM users WHERE api_key = $1', [apiKey]);
    return result.rows[0] || null;
  }
};

export const usageDB = {
  record: async (userId: string, missionId: string, botType: string, energyUsed: number) => {
    await pool.query(
      'INSERT INTO usage (user_id, mission_id, bot_type, energy_used) VALUES ($1, $2, $3, $4)',
      [userId, missionId, botType, energyUsed]
    );
  },
  
  getUsage: async (userId: string, after?: string) => {
    if (after) {
      const result = await pool.query(
        'SELECT * FROM usage WHERE user_id = $1 AND timestamp >= $2 ORDER BY timestamp DESC',
        [userId, after]
      );
      return result.rows;
    } else {
      const result = await pool.query(
        'SELECT * FROM usage WHERE user_id = $1 ORDER BY timestamp DESC',
        [userId]
      );
      return result.rows;
    }
  }
};

export const db = pool;
