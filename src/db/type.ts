export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  plan: string;
  api_key: string;
  created_at: string | Date;
}

export interface Usage {
  id?: number | string;
  user_id: string;
  mission_id: string;
  bot_type: string;
  energy_used: number;
  timestamp: string | Date;
}

export interface UserDatabase {
  create(user: Omit<User, 'created_at'>): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByApiKey(apiKey: string): Promise<User | null>;
}

export interface UsageDatabase {
  record(userId: string, missionId: string, botType: string, energyUsed: number): Promise<void>;
  getUsage(userId: string, after?: string): Promise<Usage[]>;
}

export interface Database {
  init(): Promise<void>;
  users: UserDatabase;
  usage: UsageDatabase;
}
