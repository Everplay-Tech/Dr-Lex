
import sys, json, datetime
def emit(mid, level, payload):
    print(json.dumps({"mission_id": mid, "ts": datetime.datetime.utcnow().isoformat()+"Z", "level": level, "payload": payload}), flush=True)
args = json.loads(sys.argv[1]); mission = args["mission"]; mid = mission["id"]
topics = mission.get("params",{}).get("topics",["pricing-tools","ai-prompts","vendor-matrix"])
emit(mid,"info",{"stage":"catalog_plan","topics":topics})
emit(mid,"metric",{"kpi":{"longevity":0.64,"defense":0.72}})
