import { Request, Response, NextFunction } from "express";
import { usageDB } from "../db/index.js";

// Plan limits (energy per day)
const PLAN_LIMITS = {
  free: 10000,      // ~2 bots per day
  starter: 100000,  // ~20 bots per day  
  pro: 500000,      // ~100 bots per day
  team: 2000000     // ~400 bots per day
};

export function checkUsageLimit(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  const requestedEnergy = req.body.energy_limit || 5000;
  
  // Get today's usage
  const today = new Date().toISOString().split('T')[0];
  const usage = usageDB.getUsage(user.id, today + 'T00:00:00.000Z');
  const usedToday = usage.reduce((sum: number, u: any) => sum + u.energy_used, 0);
  
  const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  
  if (usedToday + requestedEnergy > limit) {
    return res.status(429).json({ 
      error: 'Usage limit exceeded',
      plan: user.plan,
      limit,
      used: usedToday,
      requested: requestedEnergy,
      upgrade_url: '/pricing'
    });
  }
  
  next();
}
