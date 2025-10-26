import { Router } from "express";
import { userDB, usageDB } from "../db/index.js";

export const account = Router();

account.get("/me", (req, res) => {
  const user = (req as any).user;
  const fullUser: any = userDB.findById(user.id);
  
  if (!fullUser) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json({
    id: fullUser.id,
    email: fullUser.email,
    name: fullUser.name,
    plan: fullUser.plan,
    created_at: fullUser.created_at,
    api_key: fullUser.api_key
  });
});

account.get("/usage", (req, res) => {
  const user = (req as any).user;
  const today = new Date().toISOString().split('T')[0];
  
  const allUsage = usageDB.getUsage(user.id);
  const todayUsage = usageDB.getUsage(user.id, today + 'T00:00:00.000Z');
  
  const usedToday = todayUsage.reduce((sum: number, u: any) => sum + u.energy_used, 0);
  const usedAllTime = allUsage.reduce((sum: number, u: any) => sum + u.energy_used, 0);
  
  const PLAN_LIMITS: any = {
    free: 10000,
    starter: 100000,
    pro: 500000,
    team: 2000000
  };
  
  res.json({
    plan: user.plan,
    today: {
      used: usedToday,
      limit: PLAN_LIMITS[user.plan] || PLAN_LIMITS.free,
      remaining: (PLAN_LIMITS[user.plan] || PLAN_LIMITS.free) - usedToday
    },
    all_time: {
      total_energy: usedAllTime,
      total_missions: allUsage.length
    },
    recent: allUsage.slice(0, 10)
  });
});
