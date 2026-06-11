import mongoose from "mongoose";
import question from "../models/question.js";
import user from "../models/auth.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  const { noofanswer, answerbody, useranswered, userid } = req.body;
  updatenoofanswer(_id, noofanswer);

  try {
    const updatequestion = await question.findByIdAndUpdate(_id, {
      $addToSet: { answer: [{ answerbody, useranswered, userid }] },
    });

    // Award 5 points for posting an answer
    if (userid) {
      await user.findByIdAndUpdate(userid, { $inc: { points: 5 } });
    }

    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

const updatenoofanswer = async (_id, noofanswer) => {
  try {
    await question.findByIdAndUpdate(_id, { $set: { noofanswer: noofanswer } });
  } catch (error) {
    console.log(error);
  }
};

export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noofanswer, answerid, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({ message: "answer unavailable" });
  }
  updatenoofanswer(_id, noofanswer);
  try {
    const updatequestion = await question.updateOne(
      { _id },
      {
        $pull: { answer: { _id: answerid } },
      }
    );

    // Deduct 5 points when answer is deleted
    if (userid) {
      await user.findByIdAndUpdate(userid, { $inc: { points: -5 } });
    }

    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

// Vote on an answer (upvote awards bonus points at 5 upvotes threshold)
export const voteAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerId, value, voterId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    const answerDoc = questionDoc.answer.id(answerId);
    if (!answerDoc) return res.status(404).json({ message: "Answer not found" });

    if (value === "downvote") {
      // Deduct 5 points from the answer author on downvote
      if (answerDoc.userid) {
        await user.findByIdAndUpdate(answerDoc.userid, { $inc: { points: -5 } });
      }
    }

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};
