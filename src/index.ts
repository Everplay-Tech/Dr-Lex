import "dotenv/config";
import express from "express";
import { bots } from "./routes/bots.js";
import { missions } from "./routes/missions.js";
import { treasury } from "./routes/treasury.js";
import { policies } from "./routes/policies.js";
import { templates } from "./routes/templates.js";
import { feedback } from "./routes/feedback.js";
import { account } from "./routes/account.js";
import { billing } from "./routes/billing.js";
import { auth, requireAuth } from "./auth/index.js";
import { initDB } from "./db/index.js";

const app = express();

// Webhook needs raw body
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
  const { billing } = await import("./routes/billing.js");
  billing(req, res, next);
});
// Diagnostic endpoint for PostgreSQL testing
app.get("/api/diagnostic/db", async (req, res) => {
  const results: any = {
    env: {
      hasDatabaseURL: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
    tests: {}
  };
  
  try {
    // Test 1: Can we import postgres package?
    results.tests.postgresImport = "attempting...";
    const postgresLib = await import('postgres');
    results.tests.postgresImport = "success";
    results.tests.hasDefault = !!postgresLib.default;
    
    // Test 2: Can we import our postgres module?
    results.tests.postgresModule = "attempting...";
    const postgres = await import('./db/postgres.js');
    results.tests.postgresModule = "success";
    results.tests.hasUserDB = !!postgres.userDB;
    results.tests.hasInitDB = !!postgres.initDB;
    
    // Test 3: Can we call initDB?
    if (process.env.DATABASE_URL) {
      results.tests.initDB = "attempting...";
      await postgres.initDB();
      results.tests.initDB = "success";
    }
    
  } catch (error: any) {
    results.error = {
      message: error.message,
      stack: error.stack
    };
  }
  
  res.json(results);
});
  
  res.json(results);
});

app.use(express.json());

// Initialize database
initDB();

// Public routes
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), policy_checksum: "v1" });
});

// Auth routes (public)
app.use("/api/auth", auth);

// Billing - pricing is public, checkout requires auth
app.get("/api/billing/pricing", async (req, res, next) => {
  billing(req, res, next);
});
app.use("/api/billing", requireAuth, billing);

// Protected routes (require authentication)
app.use("/api/account", requireAuth, account);
app.use("/api/bots", requireAuth, bots);
app.use("/api/missions", requireAuth, missions);
app.use("/api/treasury", requireAuth, treasury);
app.use("/api/policies", policies);
app.use("/api/templates", templates);
app.use("/api/feedback", feedback);

// Serve static console
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Dr Lex core up at http://localhost:" + PORT);
  console.log("Open the Web Console at /");
});
