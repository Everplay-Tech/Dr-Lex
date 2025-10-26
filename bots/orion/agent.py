
import sys, json, datetime, time

def emit(mid, level, payload):
    print(json.dumps({"mission_id": mid, "ts": datetime.datetime.utcnow().isoformat()+"Z", "level": level, "payload": payload}), flush=True)

args = json.loads(sys.argv[1])
mission = args["mission"]
policy = args.get("policy", {})
mid = mission["id"]

from pathlib import Path
root = Path("data/treasury"); root.mkdir(parents=True, exist_ok=True)
ledger_path = root / "ledger.json"
if not ledger_path.exists():
    emit(mid, "error", {"error":"ledger_missing"}); sys.exit(1)
ledger = json.loads(ledger_path.read_text())
cash = ledger["balances"]["cash"]
scenarios = [
  {"name":"Base", "growth_mom":0.08, "runway_m":18, "alloc":{"runway":0.5,"r_and_d":0.2,"impact":0.2,"buffer":0.1}},
  {"name":"Aggressive", "growth_mom":0.15, "runway_m":12, "alloc":{"runway":0.45,"r_and_d":0.3,"impact":0.15,"buffer":0.1}},
  {"name":"Defensive", "growth_mom":0.05, "runway_m":24, "alloc":{"runway":0.55,"r_and_d":0.15,"impact":0.2,"buffer":0.1}}
]
rec = scenarios[0]
if cash < 50000: rec = scenarios[2]
elif cash > 200000: rec = scenarios[1]
(root / "recommendation.json").write_text(json.dumps(rec, indent=2))
emit(mid, "info", {"stage":"orion_recommendation","rec": rec})
emit(mid, "metric", {"kpi":{"recommended": rec["name"], "defense": 0.72}})
