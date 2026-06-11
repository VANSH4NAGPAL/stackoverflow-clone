import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js"
import questionroute from "./routes/question.js"
import answerroutes from "./routes/answer.js";
import socialroutes from "./routes/social.js";
import forgotpasswordroutes from "./routes/forgotPassword.js";
import subscriptionroutes from "./routes/subscription.js";
import pointsroutes from "./routes/points.js";
import languageroutes from "./routes/language.js";
import loginHistoryRoute from "./routes/loginHistory.js";
import aiRoute from "./routes/ai.js";
import savesRoute from "./routes/saves.js";
import challengeRoute from "./routes/challenge.js";
import chatRoute from "./routes/chat.js";
import articleRoute from "./routes/article.js";
import companyRoute from "./routes/company.js";
import searchRoute from "./routes/search.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});
app.use('/user',userroutes)
app.use('/question',questionroute)
app.use('/answer',answerroutes);
app.use('/social', socialroutes);
app.use('/forgot-password', forgotpasswordroutes);
app.use('/subscription', subscriptionroutes);
app.use('/points', pointsroutes);
app.use('/language', languageroutes);
app.use("/login-history", loginHistoryRoute);
app.use("/ai", aiRoute);
app.use("/saves", savesRoute);
app.use("/challenges", challengeRoute);
app.use("/chat", chatRoute);
app.use("/articles", articleRoute);
app.use("/companies", companyRoute);
app.use("/search", searchRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

mongoose
  .connect(databaseurl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
