import post from "../models/post.js";
import user from "../models/auth.js";
import path from "path";

// Helper: get IST date string for today
const getTodayIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split("T")[0];
};

// Get posting limit based on follower count
const getPostingLimit = (followerCount) => {
  if (followerCount === 0) return 0;
  if (followerCount === 1) return 1;
  if (followerCount === 2) return 2;
  if (followerCount > 10) return Infinity;
  return 2; // 3-10 followers = 2/day
};

// GET all posts (public feed)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await post.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// CREATE post
export const createPost = async (req, res) => {
  const userId = req.userid;
  try {
    const currentUser = await user.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const followerCount = currentUser.followers.length;
    const limit = getPostingLimit(followerCount);
    if (limit === 0) {
      return res.status(403).json({ message: "You need at least 1 follower to post on the public page." });
    }

    // Count today's posts by this user
    if (limit !== Infinity) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const todayPostCount = await post.countDocuments({
        userId,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });
      if (todayPostCount >= limit) {
        return res.status(403).json({
          message: `You can only post ${limit} time(s) per day with ${followerCount} follower(s). Get more followers to post more!`,
        });
      }
    }

    const { caption, mediaType, youtubeUrl } = req.body;
    let mediaUrl = "";

    if (req.file) {
      mediaUrl = req.file.path;
    }

    const newPost = await post.create({
      userId,
      userName: currentUser.name,
      caption,
      mediaType: mediaType || "text",
      mediaUrl,
      youtubeUrl: youtubeUrl || "",
    });

    res.status(201).json({ data: newPost, message: "Post created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// LIKE / UNLIKE a post
export const likePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.userid;
  try {
    const existingPost = await post.findById(id);
    if (!existingPost) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = existingPost.likes.includes(userId);
    if (alreadyLiked) {
      existingPost.likes = existingPost.likes.filter((uid) => uid.toString() !== userId);
    } else {
      existingPost.likes.push(userId);
    }
    await existingPost.save();
    res.status(200).json({ data: existingPost, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.userid;
  const { text } = req.body;
  try {
    const currentUser = await user.findById(userId);
    const existingPost = await post.findById(id);
    if (!existingPost) return res.status(404).json({ message: "Post not found" });

    existingPost.comments.push({ userId, userName: currentUser.name, text });
    await existingPost.save();
    res.status(200).json({ data: existingPost });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// SHARE (increment share count)
export const sharePost = async (req, res) => {
  const { id } = req.params;
  try {
    const existingPost = await post.findByIdAndUpdate(id, { $inc: { shares: 1 } }, { new: true });
    res.status(200).json({ data: existingPost });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// FOLLOW a user
export const followUser = async (req, res) => {
  const followerId = req.userid;
  const { id: targetId } = req.params;
  try {
    if (followerId === targetId) return res.status(400).json({ message: "You cannot follow yourself" });

    const follower = await user.findById(followerId);
    const target = await user.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const alreadyFollowing = follower.following.includes(targetId);
    if (alreadyFollowing) {
      follower.following = follower.following.filter((uid) => uid.toString() !== targetId);
      target.followers = target.followers.filter((uid) => uid.toString() !== followerId);
    } else {
      follower.following.push(targetId);
      target.followers.push(followerId);
    }
    await follower.save();
    await target.save();
    res.status(200).json({ following: !alreadyFollowing, message: !alreadyFollowing ? "Followed" : "Unfollowed" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
