import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { userDB } from "../db/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production-" + randomUUID();

export const auth = Router();

// Register
await userDB.create({ id, email, password_hash, name, api_key });
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    const existing = userDB.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const api_key = "sk_" + randomUUID().replace(/-/g, "");
    
    userDB.create({ id, email, password_hash, name, api_key });
    
    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ 
      ok: true, 
      token, 
      user: { id, email, name, plan: "free" },
      api_key 
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Login
auth.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user: any = userDB.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ 
      ok: true, 
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      api_key: user.api_key
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }
  
  // Support both JWT tokens and API keys
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      // Fetch fresh user data to get current plan
      const user: any = userDB.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      (req as any).user = { id: user.id, email: user.email, plan: user.plan };
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } else if (authHeader.startsWith("sk_")) {
    const apiKey = authHeader;
    const user: any = userDB.findByApiKey(apiKey);
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    (req as any).user = { id: user.id, email: user.email, plan: user.plan };
    next();
  } else {
    return res.status(401).json({ error: "Invalid authorization format" });
  }
}
