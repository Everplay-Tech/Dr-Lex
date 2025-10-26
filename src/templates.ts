
import fs from "fs";
import path from "path";
import crypto from "crypto";

const TEMPLATES = path.resolve("data/templates.json");

export type Blueprint = { id: string; intent: string; inputs: Record<string, any>; policy_id: string; outcome: { EI: number; LS: number; DS: number }; created_at: string };

function ensure(){ if(!fs.existsSync(TEMPLATES)){ fs.mkdirSync(path.dirname(TEMPLATES), { recursive: true }); fs.writeFileSync(TEMPLATES, JSON.stringify([], null, 2)); } }

export function listTemplates(): Blueprint[]{ ensure(); return JSON.parse(fs.readFileSync(TEMPLATES,"utf-8")); }
export function saveTemplate(bp: Omit<Blueprint,"id"|"created_at">){ ensure(); const list: Blueprint[] = listTemplates(); const id = crypto.randomUUID(); const obj: Blueprint = { ...bp, id, created_at: new Date().toISOString() }; list.push(obj); fs.writeFileSync(TEMPLATES, JSON.stringify(list, null, 2)); return obj; }
