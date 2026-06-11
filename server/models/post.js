import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  userName: { type: String, required: true },
  caption: { type: String, default: "" },
  mediaType: { type: String, enum: ["image", "video", "youtube", "text"], default: "text" },
  mediaUrl: { type: String, default: "" },
  youtubeUrl: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  comments: [commentSchema],
  shares: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("post", postSchema);
