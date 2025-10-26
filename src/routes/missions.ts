
import { Router } from "express";
import { getMission, listMissions, readEvents } from "../store.js";
import { scoreMission } from "../scorer.js";
import { saveTemplate } from "../templates.js";

export const missions = Router();
missions.get("/", (req,res)=> res.json({ missions: listMissions() }));
missions.get("/:id", (req,res)=>{
  const m = getMission(req.params.id);
  if(!m) return res.status(404).json({ error_code:"NOT_FOUND", message:"Mission not found" });
  res.json({ mission: m, events: readEvents(req.params.id) });
});
missions.get("/:id/score", (req,res)=>{
  const m = getMission(req.params.id);
  if(!m) return res.status(404).json({ error_code:"NOT_FOUND", message:"Mission not found" });
  const result = scoreMission(m.id!);
  if(result.pass){
    saveTemplate({ intent: m.intent, inputs: (m as any).params||{}, policy_id: (m as any).policy_id||"lex-default", outcome: { EI: result.EI, LS: result.LS, DS: result.DS } });
  }
  res.json({ mission_id: m.id, ...result });
});
