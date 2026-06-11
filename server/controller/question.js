import mongoose from "mongoose";
import question from "../models/question.js";
import user from "../models/auth.js";

const PLAN_LIMITS = { free: 1, bronze: 5, silver: 10, gold: Infinity };

export const Askquestion = async (req, res) => {
  const { postquestiondata } = req.body;

  // Enforce subscription-based daily question limit
  if (postquestiondata?.userid) {
    try {
      const currentUser = await user.findById(postquestiondata.userid);
      if (currentUser) {
        const plan = currentUser.subscription?.plan || "free";
        const validUntil = currentUser.subscription?.validUntil;
        const isExpired = validUntil && new Date() > new Date(validUntil);
        const activePlan = isExpired ? "free" : plan;
        const limit = PLAN_LIMITS[activePlan] ?? 1;

        if (limit !== Infinity) {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          const todayCount = await question.countDocuments({
            userid: postquestiondata.userid,
            askedon: { $gte: todayStart, $lte: todayEnd },
          });
          if (todayCount >= limit) {
            return res.status(403).json({
              message: `Your ${activePlan.charAt(0).toUpperCase() + activePlan.slice(1)} plan allows only ${limit} question(s) per day. Upgrade your plan to ask more questions!`,
            });
          }
        }
      }
    } catch (err) {
      console.log("Subscription check error:", err);
    }
  }

  const postques = new question({ ...postquestiondata });
  try {
    await postques.save();
    res.status(200).json({ data: postques });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getallquestion = async (req, res) => {
  try {
    const { filter, tags, sort } = req.query;
    let query = {};
    let sortConfig = { askedon: -1 }; // Default to newest

    if (filter === "unanswered") {
      query = { $or: [{ answer: { $exists: false } }, { answer: { $size: 0 } }] };
    }
    
    if (sort === "top") {
      sortConfig = { noofanswer: -1 };
    }

    if (tags) {
      const tagsArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      if (tagsArray.length > 0) {
        query.questiontags = { $in: tagsArray };
      }
    }

    const allquestion = await question.find(query).sort(sortConfig);
    res.status(200).json({ data: allquestion });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    const upindex = questionDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = questionDoc.downvote.findIndex((id) => id === String(userid));
    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter((id) => id !== String(userid));
      }
      if (upindex === -1) {
        questionDoc.upvote.push(userid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        questionDoc.downvote.push(userid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter((id) => id !== String(userid));
      }
    }
    const questionvote = await question.findByIdAndUpdate(_id, questionDoc, { new: true });
    res.status(200).json({ data: questionvote });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getAllTags = async (req, res) => {
  try {
    const tags = await question.aggregate([
      { $unwind: "$questiontags" },
      { $group: { _id: "$questiontags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } }
    ]);
    return res.status(200).json({ data: tags });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tags" });
  }
};
