
import sys, json, datetime, time

def emit(mid, level, payload):
    print(json.dumps({"mission_id": mid, "ts": datetime.datetime.utcnow().isoformat()+"Z", "level": level, "payload": payload}), flush=True)

args = json.loads(sys.argv[1])
mission = args["mission"]
policy = args.get("policy", {})
mid = mission["id"]

import glob
from pathlib import Path
def read_jsonl(path):
    out = []
    with open(path,"r",encoding="utf-8") as f:
        for line in f:
            line=line.strip()
            if not line: continue
            try: out.append(json.loads(line))
            except: pass
    return out

root = Path("data/treasury"); root.mkdir(parents=True, exist_ok=True)
ledger_path = root / "ledger.json"
if not ledger_path.exists():
    emit(mid, "error", {"error":"ledger_missing"}); sys.exit(1)

# Compute EI/LS/DS across recent metric events
events_dir = Path("data")
metrics = {"EI":0.7,"LS":0.6,"DS":0.7}
for p in events_dir.glob("events-*.jsonl"):
    evs = read_jsonl(p)
    for e in evs:
        if e.get("level")=="metric":
            k = e.get("payload",{}).get("kpi",{})
            if "empathy" in k: metrics["EI"]=max(metrics["EI"], k["empathy"])
            if "longevity" in k: metrics["LS"]=max(metrics["LS"], k["longevity"])
            if "defense" in k: metrics["DS"]=max(metrics["DS"], k["defense"])
EIC = (metrics["EI"]*0.4)+(metrics["LS"]*0.3)+(metrics["DS"]*0.3)

ledger = json.loads(ledger_path.read_text())
alloc = {k:v for k,v in ledger["balances"].items() if k!="cash"}
action = "hold"
if EIC > 0.8:
    delta = min(0.05, alloc.get("buffer",0.0))
    alloc["buffer"] = max(0.0, alloc.get("buffer",0.0)-delta)
    alloc["impact"] = min(1.0, alloc.get("impact",0.0)+delta)
    action = "boost_impact"
elif EIC < 0.6:
    action = "freeze_impact_payments"
total = alloc["runway"]+alloc["r_and_d"]+alloc["impact"]+alloc["buffer"]
for k in alloc: alloc[k] = alloc[k]/total
ledger["balances"].update(alloc)
ledger.setdefault("transactions", []).append({"ts": datetime.datetime.utcnow().isoformat()+"Z","type":"audit","amount":0,"desc":f"Eirene audit: {action} (EIC={EIC:.2f})"})
ledger["timestamp"] = datetime.datetime.utcnow().isoformat()+"Z"; ledger_path.write_text(json.dumps(ledger, indent=2))
(root / "impact.json").write_text(json.dumps({"EIC":EIC,"action":action,"metrics":metrics}, indent=2))
emit(mid, "info", {"stage":"eirene_audit","EIC":EIC,"action":action,"alloc":alloc})
emit(mid, "metric", {"kpi":{"empathy": metrics["EI"], "longevity": metrics["LS"], "defense": metrics["DS"]}})
