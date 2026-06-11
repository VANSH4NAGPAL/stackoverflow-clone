import mongoose from "mongoose";

const challengeSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  points: { type: Number, required: true },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Challenge", challengeSchema);
