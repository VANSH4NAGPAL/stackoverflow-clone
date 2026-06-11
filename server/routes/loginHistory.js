import express from "express";
import { verifyLoginOTP, getLoginHistory } from "../controller/loginHistory.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/verify", verifyLoginOTP);
router.get("/", auth, getLoginHistory);

export default router;
