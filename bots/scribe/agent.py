
import sys, json, datetime
def emit(mid, level, payload):
    print(json.dumps({"mission_id": mid, "ts": datetime.datetime.utcnow().isoformat()+"Z", "level": level, "payload": payload}), flush=True)
args = json.loads(sys.argv[1]); mission = args["mission"]; mid = mission["id"]
topic = mission.get("params",{}).get("topic","Pricing Strategy")
emit(mid,"info",{"stage":"memo_outline","sections":["Context","Diagnosis","Recommendations","Risks"]})
emit(mid,"metric",{"kpi":{"empathy":0.73,"defense":0.71}})
