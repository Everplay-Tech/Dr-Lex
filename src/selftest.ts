
import fs from "fs";
import path from "path";
import { listPolicies, checksum } from "./policy.js";

export function mirrorRootPlan(){
  const md = path.resolve("docs/root-system-plan.md");
  const out = path.resolve("data/root-system-plan.json");
  try{
    const raw = fs.readFileSync(md,"utf-8");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ raw, mirrored_at: new Date().toISOString() }, null, 2));
  }catch{ /* ignore */ }
}

export function runSelftest(){
  const dirs = ["data","data/treasury","policies","docs"];
  const checks: Record<string, any> = {};
  for(const d of dirs){ checks[d] = fs.existsSync(path.resolve(d)); }
  const policies = listPolicies().map(p => ({ id: p.id, checksum: checksum(p) }));
  return { ok: true, checks, policies };
}
