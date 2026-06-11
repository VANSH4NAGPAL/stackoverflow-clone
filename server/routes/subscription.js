import express from "express";
import { getPlans, createSubscriptionIntent, confirmSubscription, getMySubscription } from "../controller/subscription.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/my-subscription", auth, getMySubscription);
router.post("/create-intent", auth, createSubscriptionIntent);
router.post("/confirm", auth, confirmSubscription);

export default router;
