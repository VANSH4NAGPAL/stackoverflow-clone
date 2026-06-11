import user from "../models/auth.js";
import { createPaymentIntent, retrievePaymentIntent, PLANS } from "../utils/stripe.js";
import { sendInvoiceEmail } from "../utils/mailer.js";

// Check if current time is within payment window (10AM - 11AM IST)
const isWithinPaymentWindow = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const totalMinutes = hours * 60 + minutes;
  // 10:00 AM = 600 min, 11:00 AM = 660 min
  return totalMinutes >= 600 && totalMinutes < 660;
};

// GET all plans
export const getPlans = async (req, res) => {
  try {
    const plans = Object.entries(PLANS).map(([key, val]) => ({
      key,
      name: val.name,
      price: val.price,
      currency: val.currency,
      dailyLimit: val.dailyLimit === Infinity ? "Unlimited" : val.dailyLimit,
    }));
    res.status(200).json({ data: plans });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// CREATE payment intent
export const createSubscriptionIntent = async (req, res) => {
  const { plan } = req.body;
  const userId = req.userid;

  try {
    if (plan === "free") return res.status(400).json({ message: "No payment required for free plan." });

    const paymentIntent = await createPaymentIntent(plan);
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      plan,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// CONFIRM subscription after payment
export const confirmSubscription = async (req, res) => {
  const { paymentIntentId, plan } = req.body;
  const userId = req.userid;

  try {
    const intent = await retrievePaymentIntent(paymentIntentId);
    if (intent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed yet." });
    }

    const planData = PLANS[plan];
    if (!planData) return res.status(400).json({ message: "Invalid plan." });

    // Set subscription valid for 30 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      {
        subscription: {
          plan,
          validUntil,
          paymentId: paymentIntentId,
        },
      },
      { new: true }
    );

    // Send invoice email
    await sendInvoiceEmail(updatedUser.email, {
      planName: planData.name,
      amount: (planData.amount / 100).toFixed(2),
      currency: "₹",
      paymentId: paymentIntentId,
      userName: updatedUser.name,
      validUntil,
    });

    res.status(200).json({
      message: `Successfully subscribed to ${planData.name} plan! Invoice sent to your email.`,
      data: updatedUser.subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET current user subscription
export const getMySubscription = async (req, res) => {
  const userId = req.userid;
  try {
    const currentUser = await user.findById(userId).select("subscription name email");
    const plan = currentUser.subscription?.plan || "free";
    const validUntil = currentUser.subscription?.validUntil;
    const isExpired = validUntil && new Date() > new Date(validUntil);
    const activePlan = isExpired ? "free" : plan;

    res.status(200).json({
      data: {
        plan: activePlan,
        validUntil: isExpired ? null : validUntil,
        dailyLimit: PLANS[activePlan]?.dailyLimit === Infinity ? "Unlimited" : PLANS[activePlan]?.dailyLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
