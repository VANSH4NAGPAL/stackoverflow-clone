import users from "../models/auth.js";
import Question from "../models/question.js";

export const toggleSave = async (req, res) => {
  const { questionId } = req.body;
  const userId = req.userid;

  if (!questionId) {
    return res.status(400).json({ message: "Question ID is required" });
  }

  try {
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSaved = user.saves.includes(questionId);
    
    if (isSaved) {
      user.saves = user.saves.filter((id) => id.toString() !== questionId);
    } else {
      user.saves.push(questionId);
    }
    
    await user.save();
    return res.status(200).json({ data: user.saves, message: isSaved ? "Removed from saves" : "Added to saves" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to toggle save" });
  }
};

export const getSavedQuestions = async (req, res) => {
  const userId = req.userid;

  try {
    const user = await users.findById(userId).populate({
      path: "saves",
      model: Question,
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ data: user.saves });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch saved questions" });
  }
};
