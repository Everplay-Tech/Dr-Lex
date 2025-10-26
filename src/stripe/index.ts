import Stripe from "stripe";
import { userDB } from "../db/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia"
});

// Product prices (monthly)
export const PRICING = {
  starter: { amount: 2900, name: "Starter", energy: 100000 },
  pro: { amount: 9900, name: "Pro", energy: 500000 },
  team: { amount: 29900, name: "Team", energy: 2000000 }
};

export async function createCheckoutSession(userId: string, plan: string, successUrl: string, cancelUrl: string) {
  const user: any = userDB.findById(userId);
  if (!user) throw new Error("User not found");

  const priceData = PRICING[plan as keyof typeof PRICING];
  if (!priceData) throw new Error("Invalid plan");

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: `Dr Lex ${priceData.name} Plan`,
          description: `${priceData.energy.toLocaleString()} energy per day`
        },
        recurring: { interval: "month" },
        unit_amount: priceData.amount
      },
      quantity: 1
    }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, plan }
  });

  return session;
}

export async function handleWebhook(body: any, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Missing webhook secret");

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      
      // Update user plan
      const db = await import("../db/index.js");
      db.db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(plan, userId);
      break;
    }
    
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      // Handle subscription changes
      break;
    }
  }

  return event;
}

export { stripe };
