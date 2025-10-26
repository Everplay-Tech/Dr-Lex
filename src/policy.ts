
import fs from "fs";
import path from "path";
import crypto from "crypto";

export type Policy = {
  id: string;
  version: string;
  ethics: string[];
  domain: string[];
  budget: { max_ms?: number; max_events?: number; };
};

const POLICY_DIR = path.resolve("policies");

export function listPolicies(): Policy[]{
  if(!fs.existsSync(POLICY_DIR)) return [];
  return fs.readdirSync(POLICY_DIR).filter(f => f.endsWith(".json")).map(f => JSON.parse(fs.readFileSync(path.join(POLICY_DIR,f),"utf-8")));
}

export function getPolicy(id: string): Policy | undefined {
  return listPolicies().find(p => p.id === id);
}

export function checksum(p: Policy): string{
  const h = crypto.createHash("sha256"); h.update(JSON.stringify(p)); return h.digest("hex").slice(0,16);
}
