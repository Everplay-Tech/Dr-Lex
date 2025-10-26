
import fs from "fs";
import path from "path";

const METRICS = path.resolve("data/metrics.json");

type Metrics = { helpful: number; total: number; latency_ms: number[]; collaborations: number; history: { ts: string; ei: number }[]; };

function ensure(): Metrics {
  if (!fs.existsSync(METRICS)) {
    const m: Metrics = { helpful: 0, total: 0, latency_ms: [], collaborations: 0, history: [] };
    fs.mkdirSync(path.dirname(METRICS), { recursive: true });
    fs.writeFileSync(METRICS, JSON.stringify(m, null, 2));
    return m;
  }
  return JSON.parse(fs.readFileSync(METRICS, "utf-8"));
}

export function recordFeedback(rating: "up"|"down"){
  const m = ensure(); m.total += 1; if(rating==="up") m.helpful += 1; save(m);
}
export function recordLatency(ms: number){
  const m = ensure(); m.latency_ms.push(ms); if(m.latency_ms.length > 200) m.latency_ms.shift(); save(m);
}
export function recordCollaboration(){ const m = ensure(); m.collaborations += 1; save(m); }

export function computeEI(){
  const m = ensure();
  const HR = m.total ? m.helpful / m.total : 0.7;
  const avgLat = m.latency_ms.length ? (m.latency_ms.reduce((a,b)=>a+b,0)/m.latency_ms.length) : 800;
  const RL_norm = Math.min(1, Math.max(0, avgLat/3000));
  const CR = Math.min(1, m.collaborations / Math.max(1, m.total));
  const EI = (0.4 * HR) + (0.3 * (1-RL_norm)) + (0.3 * CR);
  return { EI, HR, RL_ms: avgLat, CR };
}
export function pushHistory(){
  const m = ensure(); const { EI } = computeEI(); m.history.push({ ts: new Date().toISOString(), ei: EI }); if(m.history.length > 200) m.history.shift(); save(m);
}
export function getMetrics(){ const m = ensure(); return { ...computeEI(), history: m.history, helpful: m.helpful, total: m.total }; }
function save(m: any){ fs.writeFileSync(METRICS, JSON.stringify(m, null, 2), "utf-8"); }
