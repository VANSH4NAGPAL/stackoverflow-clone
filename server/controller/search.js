import Question from "../models/question.js";

export const searchQuestions = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const questions = await Question.find({
      $or: [
        { questiontitle: { $regex: q, $options: "i" } },
        { questionbody: { $regex: q, $options: "i" } },
        { questiontags: { $regex: q, $options: "i" } }
      ]
    }).limit(20);

    return res.status(200).json({ data: questions });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Failed to perform search" });
  }
};
