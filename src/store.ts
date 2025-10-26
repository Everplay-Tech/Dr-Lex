
import fs from "fs";
import path from "path";
import { Event, Mission } from "./protocol.js";

const DATA_DIR = path.resolve("data");
const MISSIONS = path.join(DATA_DIR, "missions.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MISSIONS)) fs.writeFileSync(MISSIONS, JSON.stringify([]), "utf-8");

export function saveMission(m: Mission){
  const list: any[] = JSON.parse(fs.readFileSync(MISSIONS, "utf-8"));
  const i = list.findIndex(x => x.id === m.id);
  if(i>=0) list[i] = m; else list.push(m);
  fs.writeFileSync(MISSIONS, JSON.stringify(list, null, 2), "utf-8");
}

export function listMissions(): Mission[]{
  return JSON.parse(fs.readFileSync(MISSIONS, "utf-8"));
}

export function getMission(id: string): Mission | undefined {
  return listMissions().find(m => m.id === id);
}

export function appendEvent(e: Event){
  const p = path.join(DATA_DIR, `events-${e.mission_id}.jsonl`);
  fs.appendFileSync(p, JSON.stringify(e) + "\n", "utf-8");
}

export function readEvents(missionId: string): Event[]{
  const p = path.join(DATA_DIR, `events-${missionId}.jsonl`);
  if(!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf-8").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
}
