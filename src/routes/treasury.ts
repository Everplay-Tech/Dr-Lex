
import { Router } from "express";
import fs from "fs";
import path from "path";
import { spawnBot } from "../orchestrator.js";

export const treasury = Router();
const ROOT = path.resolve("data/treasury");
const LEDGER = path.join(ROOT, "ledger.json");
const RECOMMENDATION = path.join(ROOT, "recommendation.json");
const IMPACT = path.join(ROOT, "impact.json");
function ensureDir(){ if(!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true }); }

treasury.get("/", (req,res)=>{
  ensureDir();
  const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER,"utf-8")) : null;
  const rec = fs.existsSync(RECOMMENDATION) ? JSON.parse(fs.readFileSync(RECOMMENDATION,"utf-8")) : null;
  const imp = fs.existsSync(IMPACT) ? JSON.parse(fs.readFileSync(IMPACT,"utf-8")) : null;
  res.json({ ledger, recommendation: rec, impact: imp });
});
treasury.post("/allocate", async (req,res)=>{
  ensureDir();
  const out = await spawnBot({ intent: "demo.orion.allocate", energy_limit: 1000 });
  res.json({ ok:true, mission_id: out.mission_id });
});
treasury.post("/audit", async (req,res)=>{
  ensureDir();
  const out = await spawnBot({ intent: "demo.eirene.audit", energy_limit: 1000, policy_id: "lex-default" });
  res.json({ ok:true, mission_id: out.mission_id });
});
treasury.post("/ledger", async (req,res)=>{
  const body = req.body || {};
  const out = await spawnBot({ intent: "demo.ledger.treasury", energy_limit: 1000, params: body });
  res.json({ ok:true, mission_id: out.mission_id });
});
