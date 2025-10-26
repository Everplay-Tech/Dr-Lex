
import { readEvents } from "./store.js";

export function scoreMission(missionId: string){
  const events = readEvents(missionId).filter(e => e.level === "metric");
  let EI = 0.7, LS = 0.6, DS = 0.7;
  for(const e of events){
    const kpi = (e as any).payload?.kpi || {};
    if (typeof kpi.empathy === "number") EI = Math.max(EI, kpi.empathy);
    if (typeof kpi.longevity === "number") LS = Math.max(LS, kpi.longevity);
    if (typeof kpi.defense === "number") DS = Math.max(DS, kpi.defense);
    if (typeof kpi.gtm_days === "number") LS = Math.max(LS, 0.6 + Math.min(0.2, 7 / (kpi.gtm_days*10)));
    if (typeof kpi.opportunities === "number") EI = Math.max(EI, Math.min(0.9, 0.6 + kpi.opportunities*0.05));
    if (kpi.policy_checksum) DS = Math.max(DS, 0.75);
    if (kpi.recommended) DS = Math.max(DS, 0.7);
  }
  const pass = EI >= 0.7 && LS >= 0.6 && DS >= 0.7;
  return { EI, LS, DS, pass };
}
