import express from "express";
import { sendMessage, getConversation } from "../controller/chat.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/send", auth, sendMessage);
router.get("/conversation/:userId2", auth, getConversation);

export default router;
