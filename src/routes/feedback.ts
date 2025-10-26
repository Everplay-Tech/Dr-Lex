
import { Router } from "express";
import { recordFeedback, getMetrics, pushHistory } from "../metrics.js";
export const feedback = Router();
feedback.post("/", (req,res)=>{
  const rating = req.body?.rating;
  if(rating !== "up" && rating !== "down") return res.status(400).json({ error_code:"BAD_RATING" });
  recordFeedback(rating); pushHistory(); res.json({ ok: true, metrics: getMetrics() });
});
feedback.get("/ei", (req,res)=> res.json({ ok: true, ...getMetrics() }));
