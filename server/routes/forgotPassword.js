import express from "express";
import { requestForgotPasswordOTP, verifyOTPAndResetPassword } from "../controller/forgotPassword.js";

const router = express.Router();

router.post("/request-otp", requestForgotPasswordOTP);
router.post("/reset", verifyOTPAndResetPassword);

export default router;
