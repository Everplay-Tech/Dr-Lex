
import sys, json, datetime
def emit(mid, level, payload):
    print(json.dumps({"mission_id": mid, "ts": datetime.datetime.utcnow().isoformat()+"Z", "level": level, "payload": payload}), flush=True)
args = json.loads(sys.argv[1]); mission = args["mission"]; mid = mission["id"]
engine = mission.get("params",{}).get("engine","A")
if engine == "A":
    offer = {"name":"Inbox Triage Mini‑SaaS","tiers":[{"plan":"Starter","price":19},{"plan":"Pro","price":39},{"plan":"Team","price":79}]}
elif engine == "B":
    offer = {"name":"Trend Micro‑Datasets Pack","tiers":[{"plan":"Monthly","price":49},{"plan":"Quarterly","price":129}]}
else:
    offer = {"name":"Strategy Memo","tiers":[{"plan":"Single","price":299},{"plan":"Pack of 4","price":999}]}
emit(mid,"info",{"stage":"offer_draft","offer":offer})
emit(mid,"metric",{"kpi":{"empathy":0.71,"longevity":0.62,"defense":0.7}})
