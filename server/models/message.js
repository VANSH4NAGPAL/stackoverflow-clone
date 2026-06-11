import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
