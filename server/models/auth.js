import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  phone: { type: String, default: "" },
  points: { type: Number, default: 0 },
  language: { type: String, default: "en" },
  subscription: {
    plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free" },
    validUntil: { type: Date, default: null },
    paymentId: { type: String, default: "" },
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

export default mongoose.model("user", userschema);
