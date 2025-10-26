
import sys, json, datetime, time

def emit(mid, level, payload):
    print(json.dumps({"mission_id": mid, "ts": datetime.datetime.utcnow().isoformat()+"Z", "level": level, "payload": payload}), flush=True)

args = json.loads(sys.argv[1])
mission = args["mission"]
policy = args.get("policy", {})
mid = mission["id"]

emit(mid, "info", {"stage":"start","bot":"arbitra"})
ideas = ["contract parsing APIs","B2B cold email QA","CSV-to-API no-code","privacy-safe lead enrichment"]
for idea in ideas:
    time.sleep(0.05)
    emit(mid, "info", {"signal":{"idea": idea, "est_margin": 0.7}})
emit(mid, "metric", {"kpi":{"opportunities": len(ideas), "empathy":0.7}})
