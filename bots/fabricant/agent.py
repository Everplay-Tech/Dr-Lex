
import sys, json, datetime, time

def emit(mid, level, payload):
    print(json.dumps({"mission_id": mid, "ts": datetime.datetime.utcnow().isoformat()+"Z", "level": level, "payload": payload}), flush=True)

args = json.loads(sys.argv[1])
mission = args["mission"]
policy = args.get("policy", {})
mid = mission["id"]

emit(mid, "info", {"stage":"start","bot":"fabricant"})
product = mission.get("params",{}).get("product","Unnamed Product")
plan = [
  {"day":1,"focus":"ICP & pain points","deliverable":"1-pager problem thesis"},
  {"day":2,"focus":"Offer & pricing","deliverable":"Value ladder + price test"},
  {"day":3,"focus":"Landing page","deliverable":"LP draft + checkout"},
  {"day":4,"focus":"Channel test","deliverable":"2 micro-ads + copy"},
  {"day":5,"focus":"Partnerships","deliverable":"10 outreach emails"},
  {"day":6,"focus":"Onboarding","deliverable":"Concierge script + FAQ"},
  {"day":7,"focus":"Metrics","deliverable":"North-star + dashboards"}
]
for step in plan:
    time.sleep(0.05)
    emit(mid, "info", {"progress": step, "product": product})
emit(mid, "metric", {"kpi":{"gtm_days":7,"empathy":0.72,"longevity":0.63,"defense":0.7}})
