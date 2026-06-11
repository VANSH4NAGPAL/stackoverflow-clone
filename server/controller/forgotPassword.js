import user from "../models/auth.js";
import otp from "../models/otp.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/mailer.js";

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate letters-only password (upper + lower, no numbers/special chars)
const generateLetterPassword = (length = 12) => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const all = upper + lower;
  let password = "";
  // Ensure at least 2 uppercase + 2 lowercase
  for (let i = 0; i < 2; i++) password += upper[Math.floor(Math.random() * upper.length)];
  for (let i = 0; i < 2; i++) password += lower[Math.floor(Math.random() * lower.length)];
  for (let i = 4; i < length; i++) password += all[Math.floor(Math.random() * all.length)];
  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
};

// Step 1: Request OTP for forgot password
export const requestForgotPasswordOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await user.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "No account found with this email." });

    // Check daily limit (1 per day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existingRequest = await otp.findOne({
      email,
      type: "forgot-password",
      createdAt: { $gte: todayStart },
    });
    if (existingRequest) {
      return res.status(429).json({ message: "You can use this option only one time per day." });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await otp.create({ email, otp: otpCode, type: "forgot-password", expiresAt });
    await sendOTPEmail(email, otpCode, "Password Reset OTP - StackOverflow Clone");

    res.status(200).json({ message: "OTP sent to your email address." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Step 2: Verify OTP and reset password
export const verifyOTPAndResetPassword = async (req, res) => {
  const { email, otpCode } = req.body;
  try {
    const otpRecord = await otp.findOne({
      email,
      otp: otpCode,
      type: "forgot-password",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP." });

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Generate new password
    const newPassword = generateLetterPassword(12);
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(newPassword, 12);

    const existingUser = await user.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    // Send new password via email
    await sendPasswordResetEmail(email, newPassword, existingUser.name);

    res.status(200).json({ message: "Password reset successful! Check your email for the new password." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
