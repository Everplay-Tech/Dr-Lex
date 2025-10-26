
import { Router } from "express";
import { listTemplates, saveTemplate } from "../templates.js";
import { spawnBot } from "../orchestrator.js";

export const templates = Router();
templates.get("/", (req,res)=> res.json({ templates: listTemplates() }));
templates.post("/save", (req,res)=>{
  const b = req.body; if(!b?.intent || !b?.inputs || !b?.policy_id || !b?.outcome) return res.status(400).json({ error_code:"BAD_BLUEPRINT" });
  res.json({ ok:true, template: saveTemplate(b) });
});
templates.post("/replay/:id", async (req,res)=>{
  const tpl = listTemplates().find(t => t.id === req.params.id);
  if(!tpl) return res.status(404).json({ error_code:"NOT_FOUND" });
  const out = await spawnBot({ intent: tpl.intent, policy_id: tpl.policy_id, energy_limit: 1000, params: tpl.inputs });
  res.json({ ok:true, mission_id: out.mission_id });
});
