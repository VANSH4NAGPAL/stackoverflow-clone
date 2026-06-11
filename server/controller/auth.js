import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import loginHistory from "../models/loginHistory.js";
import otp from "../models/otp.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getDeviceType = (uaResult) => {
  const deviceType = uaResult.device?.type;
  if (deviceType === "mobile") return "mobile";
  if (deviceType === "tablet") return "tablet";
  const os = uaResult.os?.name?.toLowerCase() || "";
  if (os.includes("android") || os.includes("ios")) return "mobile";
  return "desktop";
};

const isMobileLoginAllowed = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const hours = istTime.getUTCHours();
  return hours >= 10 && hours < 13;
};

const isMicrosoftBrowser = (browserName) => {
  const lower = browserName.toLowerCase();
  return lower.includes("edge") || lower.includes("ie") || lower.includes("internet explorer") || lower.includes("edg");
};

const isChrome = (browserName) => browserName.toLowerCase() === "chrome";

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const ispasswordcrct = await bcrypt.compare(password, exisitinguser.password);
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Task 6: Login History & Browser Checks
    const userAgent = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Unknown";
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    const browserName = uaResult.browser?.name || "Unknown";
    const os = uaResult.os?.name || "Unknown";
    const deviceType = getDeviceType(uaResult);

    // 1. Mobile Time Gate
    if (deviceType === "mobile" && !isMobileLoginAllowed()) {
      await loginHistory.create({
        userId: exisitinguser._id,
        browser: browserName,
        os,
        deviceType,
        ipAddress: ip,
        status: "blocked",
      });
      return res.status(403).json({
        message: "Mobile login is only allowed between 10:00 AM and 1:00 PM IST.",
      });
    }

    // 2. Google Chrome OTP Gate
    if (isChrome(browserName) && !isMicrosoftBrowser(browserName)) {
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await otp.deleteMany({ email: exisitinguser.email, type: "login-otp" });
      await otp.create({ email: exisitinguser.email, otp: otpCode, type: "login-otp", expiresAt });
      await sendOTPEmail(exisitinguser.email, otpCode, "Login Verification OTP - StackOverflow Clone");

      await loginHistory.create({
        userId: exisitinguser._id,
        browser: browserName,
        os,
        deviceType,
        ipAddress: ip,
        status: "success", // Not fully logged in yet, but attempt successful
      });

      return res.status(200).json({
        requiresOTP: true,
        email: exisitinguser.email,
        message: "OTP sent to your email. Please verify to complete login.",
      });
    }

    // 3. Allowed directly (Microsoft Browser or other allowed conditions)
    await loginHistory.create({
      userId: exisitinguser._id,
      browser: browserName,
      os,
      deviceType,
      ipAddress: ip,
      status: "success",
    });

    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags } },
      { new: true }
    );
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const oauthLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let existinguser = await user.findOne({ email });
    if (!existinguser) {
      existinguser = await user.create({
        name: name || "Google User",
        email,
        password: "oauth_simulated_password",
      });
    }
    const token = jwt.sign(
      { email: existinguser.email, id: existinguser._id },
      process.env.JWT_SECRET || "test",
      { expiresIn: "1h" }
    );
    return res.status(200).json({ data: existinguser, token });
  } catch (error) {
    console.error("OAuth Error", error);
    return res.status(500).json({ message: "Invalid OAuth Token" });
  }
};

export const watchTag = async (req, res) => {
  const { tag } = req.body;
  const userId = req.userid;
  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });
    
    if (!existingUser.tags) {
      existingUser.tags = [];
    }

    if (!existingUser.tags.includes(tag)) {
      existingUser.tags.push(tag);
      await existingUser.save();
    }
    return res.status(200).json({ data: existingUser.tags });
  } catch (error) {
    console.error("Watch Tag Error:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message, stack: error.stack });
  }
};

export const unwatchTag = async (req, res) => {
  const { tag } = req.body;
  const userId = req.userid;
  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });
    
    if (!existingUser.tags) {
      existingUser.tags = [];
    }

    existingUser.tags = existingUser.tags.filter(t => t !== tag);
    await existingUser.save();
    return res.status(200).json({ data: existingUser.tags });
  } catch (error) {
    console.error("Unwatch Tag Error:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message, stack: error.stack });
  }
};
