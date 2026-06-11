import user from "../models/auth.js";
import otp from "../models/otp.js";
import { sendOTPEmail } from "../utils/mailer.js";

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REQUEST OTP before language switch
export const requestLanguageOTP = async (req, res) => {
  const userId = req.userid;
  const { language } = req.body;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ message: "Unsupported language." });
  }

  try {
    const currentUser = await user.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove previous unused OTPs for this user
    await otp.deleteMany({ email: currentUser.email, type: "language-switch" });

    await otp.create({
      email: currentUser.email,
      otp: otpCode,
      type: "language-switch",
      expiresAt,
    });

    // French → email OTP, all others → also email OTP (no SMS)
    const subject =
      language === "fr"
        ? "Email Verification OTP — Language Change"
        : "Mobile Verification OTP — Language Change";

    await sendOTPEmail(currentUser.email, otpCode, subject);

    res.status(200).json({
      message:
        language === "fr"
          ? "OTP sent to your registered email address for French language verification."
          : "OTP sent to your registered email address for language verification.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// VERIFY OTP and switch language
export const verifyLanguageOTP = async (req, res) => {
  const userId = req.userid;
  const { otpCode, language } = req.body;

  try {
    const currentUser = await user.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const otpRecord = await otp.findOne({
      email: currentUser.email,
      otp: otpCode,
      type: "language-switch",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP." });

    otpRecord.used = true;
    await otpRecord.save();

    await user.findByIdAndUpdate(userId, { language });
    res.status(200).json({ message: "Language updated successfully!", language });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
