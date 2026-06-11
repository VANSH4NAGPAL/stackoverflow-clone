import mongoose from "mongoose";

const articleSchema = mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: { type: [String], default: [] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  upvote: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  downvote: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  comments: [{
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Article", articleSchema);
