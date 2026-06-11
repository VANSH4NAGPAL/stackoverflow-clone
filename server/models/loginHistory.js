import mongoose from "mongoose";

const loginHistorySchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  browser: { type: String, default: "Unknown" },
  os: { type: String, default: "Unknown" },
  deviceType: { type: String, enum: ["desktop", "laptop", "mobile", "tablet", "unknown"], default: "unknown" },
  ipAddress: { type: String, default: "" },
  loginAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "blocked"], default: "success" },
});

export default mongoose.model("loginhistory", loginHistorySchema);
