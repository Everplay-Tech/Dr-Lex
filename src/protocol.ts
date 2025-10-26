
import { z } from "zod";

export const MissionSchema = z.object({
  id: z.string().uuid().optional(),
  intent: z.string(),
  energy_limit: z.number().int().min(1).max(100000).default(1000),
  params: z.record(z.any()).default({}),
  created_at: z.string().optional(),
  status: z.enum(["queued","running","done","error"]).optional(),
  policy_id: z.string().default("lex-default")
});

export type Mission = z.infer<typeof MissionSchema>;

export const EventSchema = z.object({
  mission_id: z.string(),
  ts: z.string(),
  level: z.enum(["info","warn","error","metric"]).default("info"),
  payload: z.record(z.any()).default({})
});

export type Event = z.infer<typeof EventSchema>;
