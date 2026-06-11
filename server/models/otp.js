import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, required: true }, // "forgot-password", "language-switch", "login-otp"
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("otp", otpSchema);
