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
