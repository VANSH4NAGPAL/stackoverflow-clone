import express from "express";
import { getChallenges, completeChallenge, addChallenge } from "../controller/challenge.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/all", getChallenges);
router.post("/complete", auth, completeChallenge);
router.post("/add", auth, addChallenge);

export default router;
