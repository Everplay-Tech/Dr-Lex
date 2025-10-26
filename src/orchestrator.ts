
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { Mission, MissionSchema, Event } from "./protocol.js";
import { saveMission, appendEvent } from "./store.js";
import { getPolicy, checksum } from "./policy.js";
import { recordLatency } from "./metrics.js";

type Listener = (e: Event)=>void;

const listeners = new Map<string, Set<Listener>>();
const statuses = new Map<string, string>();
const eventCounts = new Map<string, number>();

function emit(e: Event){
  appendEvent(e);
  const c = (eventCounts.get(e.mission_id) || 0) + 1;
  eventCounts.set(e.mission_id, c);
  const set = listeners.get(e.mission_id);
  if(set) for(const l of set) l(e);
}

export function onEvents(missionId: string, cb: Listener){
  if(!listeners.has(missionId)) listeners.set(missionId, new Set());
  listeners.get(missionId)!.add(cb);
  return ()=> listeners.get(missionId)!.delete(cb);
}

export function getStatus(missionId: string){
  return statuses.get(missionId) ?? "unknown";
}

export async function spawnBot(missionInput: Partial<Mission>): Promise<{mission_id: string}> {
  const parsed = MissionSchema.parse(missionInput);
  const policy = getPolicy(parsed.policy_id || "lex-default") || getPolicy("lex-default");
  const mission: Mission = { ...parsed, id: parsed.id ?? randomUUID(), created_at: new Date().toISOString(), status: "queued" };
  saveMission(mission);
  statuses.set(mission.id!, "queued");
  eventCounts.set(mission.id!, 0);

  const intent = mission.intent;
  const [domain, botName] = intent.split(".").slice(0,2);
  const map: Record<string,string> = {
    "demo.fabricant": "bots/fabricant/agent.py",
    "demo.arbitra": "bots/arbitra/agent.py",
    "demo.ledger": "bots/ledger/agent.py",
    "demo.orion": "bots/orion/agent.py",
    "demo.eirene": "bots/eirene/agent.py",
    "demo.merchant": "bots/merchant/agent.py",
    "demo.catalog": "bots/catalog/agent.py",
    "demo.scribe": "bots/scribe/agent.py"
  };
  const key = `${domain}.${botName}`;
  const script = map[key];
  if(!script){
    statuses.set(mission.id!, "error");
    emit({ mission_id: mission.id!, ts: new Date().toISOString(), level: "error", payload: { error: "Unknown bot", key }});
    return { mission_id: mission.id! };
  }

  statuses.set(mission.id!, "running");
  saveMission({ ...mission, status: "running" } as Mission);
  emit({ mission_id: mission.id!, ts: new Date().toISOString(), level: "info", payload: { msg: "spawn", script, policy_id: policy?.id, policy_checksum: policy ? checksum(policy) : null }});

  const missionArg = JSON.stringify({ mission, policy });
  const proc = spawn("python", [script, missionArg], { stdio: ["ignore","pipe","pipe"] });

  const start = Date.now();
  const maxMs = Math.min((policy?.budget?.max_ms ?? 10_000), (mission.energy_limit || 1_000_000));

  const timer = setInterval(() => {
    const elapsed = Date.now() - start;
    const events = eventCounts.get(mission.id!) || 0;
    if(elapsed > maxMs || (policy?.budget?.max_events && events > policy.budget.max_events)){
      proc.kill("SIGKILL");
    }
  }, 50);

  proc.stdout.on("data", chunk => {
    const lines = chunk.toString().split(/\r?\n/).filter(Boolean);
    for(const line of lines){
      try{
        const e: Event = JSON.parse(line);
        emit(e);
      }catch(e){
        emit({ mission_id: mission.id!, ts: new Date().toISOString(), level: "warn", payload: { raw: line }});
      }
    }
  });
  proc.stderr.on("data", chunk => {
    emit({ mission_id: mission.id!, ts: new Date().toISOString(), level: "warn", payload: { stderr: chunk.toString() }});
  });
  proc.on("close", code => {
    clearInterval(timer);
    recordLatency(Date.now() - start);
    const status = code === 0 ? "done" : "error";
    statuses.set(mission.id!, status);
    saveMission({ ...mission, status } as Mission);
    emit({ mission_id: mission.id!, ts: new Date().toISOString(), level: code===0 ? "info" : "error", payload: { exit: code, elapsed_ms: Date.now() - start, events: eventCounts.get(mission.id!) }});
  });
  return { mission_id: mission.id! };
}
