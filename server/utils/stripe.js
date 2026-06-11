import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PLANS = {
  free: { name: "Free", price: 0, currency: "inr", dailyLimit: 1, stripePriceId: null },
  bronze: { name: "Bronze", price: 100, currency: "inr", dailyLimit: 5, amount: 10000 },
  silver: { name: "Silver", price: 300, currency: "inr", dailyLimit: 10, amount: 30000 },
  gold: { name: "Gold", price: 1000, currency: "inr", dailyLimit: Infinity, amount: 100000 },
};

export const createPaymentIntent = async (planKey) => {
  const plan = PLANS[planKey];
  if (!plan || plan.price === 0) throw new Error("Invalid plan for payment");
  const paymentIntent = await stripe.paymentIntents.create({
    amount: plan.amount,
    currency: plan.currency,
    metadata: { plan: planKey },
  });
  return paymentIntent;
};

export const retrievePaymentIntent = async (paymentIntentId) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

export default stripe;
