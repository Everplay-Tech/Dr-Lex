import { Router } from "express";
import { createCheckoutSession, PRICING } from "../stripe/index.js";

export const billing = Router();

billing.get("/pricing", (req, res) => {
  res.json({
    plans: {
      free: { name: "Free", price: 0, energy: 10000, bots_per_day: 2 },
      starter: { name: "Starter", price: 29, energy: 100000, bots_per_day: 20 },
      pro: { name: "Pro", price: 99, energy: 500000, bots_per_day: 100 },
      team: { name: "Team", price: 299, energy: 2000000, bots_per_day: 400 }
    }
  });
});

billing.post("/checkout", async (req, res) => {
  try {
    const user = (req as any).user;
    const { plan } = req.body;

    if (!["starter", "pro", "team"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const session = await createCheckoutSession(
      user.id,
      plan,
      `${baseUrl}/dashboard?success=true`,
      `${baseUrl}/pricing?canceled=true`
    );

    res.json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

billing.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const { handleWebhook } = await import("../stripe/index.js");
    
    await handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (e: any) {
    console.error("Webhook error:", e);
    res.status(400).json({ error: e.message });
  }
});
