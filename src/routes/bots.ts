import { Router } from "express";
import { spawnBot, onEvents, getStatus } from "../orchestrator.js";
import { MissionSchema } from "../protocol.js";
import { checkUsageLimit } from "../auth/usage.js";
import { usageDB } from "../db/index.js";

export const bots = Router();

bots.post("/spawn", checkUsageLimit, async (req, res) => {
  try {
    const user = (req as any).user;
    const body = MissionSchema.partial().parse(req.body);
    const out = await spawnBot(body);
    
    // Track usage
    const energyUsed = body.energy_limit || 5000;
    const botType = body.intent?.split('.')[1] || 'unknown';
    usageDB.record(user.id, out.mission_id, botType, energyUsed);
    
    res.json(out);
  } catch (e: any) {
    res.status(400).json({ error_code: "INVALID_MISSION", message: e.message, remediation: "Check mission schema." });
  }
});

bots.get("/:id/events", async (req, res) => {
  const missionId = req.params.id;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  function send(obj: any) { res.write(`data: ${JSON.stringify(obj)}\n\n`); }
  const off = onEvents(missionId, ev => send(ev));
  send({ mission_id: missionId, ts: new Date().toISOString(), level: "info", payload: { status: getStatus(missionId) } });
  req.on("close", () => off());
});
