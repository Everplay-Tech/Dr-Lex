
import { Router } from "express";
import { getPolicy, listPolicies, checksum } from "../policy.js";
export const policies = Router();
policies.get("/", (req,res)=>{
  const list = listPolicies();
  res.json({ policies: list.map(p => ({ id: p.id, version: p.version, checksum: checksum(p), ethics: p.ethics.length, domain: p.domain.length, budget: p.budget })) });
});
policies.get("/:id", (req,res)=>{
  const p = getPolicy(req.params.id);
  if(!p) return res.status(404).json({ error_code:"NOT_FOUND", message:"Policy not found"});
  res.json({ policy: p, checksum: checksum(p) });
});
