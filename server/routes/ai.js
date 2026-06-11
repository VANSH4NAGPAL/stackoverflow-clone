import express from "express";
import { askAI } from "../controller/ai.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/ask", auth, askAI);

export default router;
