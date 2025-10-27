import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export async function initDB() {
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

  console.log('PostgreSQL database initialized');
}

export const userDB = {
  create: async (user: any) => {
    const { id, email, password_hash, name, api_key } = user;
    await sql`
      INSERT INTO users (id, email, password_hash, name, api_key)
      VALUES (${id}, ${email}, ${password_hash}, ${name}, ${api_key})
    `;
  },
  
  findByEmail: async (email: string) => {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  },
  
  findById: async (id: string) => {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0] || null;
  },
  
  findByApiKey: async (apiKey: string) => {
    const result = await sql`SELECT * FROM users WHERE api_key = ${apiKey}`;
    return result[0] || null;
  }
};

export const usageDB = {
  record: async (userId: string, missionId: string, botType: string, energyUsed: number) => {
    await sql`
      INSERT INTO usage (user_id, mission_id, bot_type, energy_used)
      VALUES (${userId}, ${missionId}, ${botType}, ${energyUsed})
    `;
  },
  
  getUsage: async (userId: string, after?: string) => {
    if (after) {
      return await sql`
        SELECT * FROM usage 
        WHERE user_id = ${userId} AND timestamp >= ${after}
        ORDER BY timestamp DESC
      `;
    } else {
      return await sql`
        SELECT * FROM usage 
        WHERE user_id = ${userId}
        ORDER BY timestamp DESC
      `;
    }
  }
};

export const db = sql;
