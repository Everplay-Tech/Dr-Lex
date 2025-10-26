
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
    ledger = {"timestamp": datetime.datetime.utcnow().isoformat()+"Z", "balances": { "cash": 100000.0, "runway": 0.5, "r_and_d": 0.2, "impact": 0.2, "buffer": 0.1 }, "transactions": []}
else:
    ledger = json.loads(ledger_path.read_text())

p = mission.get("params", {})
if "inflow" in p:
    amt = float(p["inflow"]); ledger["balances"]["cash"] += amt; ledger["transactions"].append({"ts": datetime.datetime.utcnow().isoformat()+"Z","type":"inflow","amount":amt,"desc":p.get("desc","inflow")})
if "outflow" in p:
    amt = float(p["outflow"]); ledger["balances"]["cash"] -= amt; ledger["transactions"].append({"ts": datetime.datetime.utcnow().isoformat()+"Z","type":"outflow","amount":amt,"desc":p.get("desc","outflow")})
ledger["timestamp"] = datetime.datetime.utcnow().isoformat()+"Z"; ledger_path.write_text(json.dumps(ledger, indent=2))
emit(mid, "info", {"stage":"ledger_update","balances":ledger["balances"]})
emit(mid, "metric", {"kpi":{"defense": 0.75, "longevity": 0.65}})
