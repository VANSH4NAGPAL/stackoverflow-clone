import loginHistory from "../models/loginHistory.js";
import user from "../models/auth.js";
import otp from "../models/otp.js";
import jwt from "jsonwebtoken";

// Verify login OTP (for Chrome users) and issue JWT token
export const verifyLoginOTP = async (req, res) => {
  const { email, otpCode } = req.body;
  try {
    const otpRecord = await otp.findOne({
      email,
      otp: otpCode,
      type: "login-otp",
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP." });

    otpRecord.used = true;
    await otpRecord.save();

    const exisitinguser = await user.findOne({ email });
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login verified successfully!", data: exisitinguser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET login history for a user
export const getLoginHistory = async (req, res) => {
  const userId = req.userid;
  try {
    const history = await loginHistory
      .find({ userId })
      .sort({ loginAt: -1 })
      .limit(20);
    res.status(200).json({ data: history });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
