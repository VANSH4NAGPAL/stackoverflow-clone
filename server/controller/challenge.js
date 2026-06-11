import Challenge from "../models/challenge.js";
import users from "../models/auth.js";

// initChallenges removed because we are entirely organic now.

export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find();
    return res.status(200).json({ data: challenges });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch challenges" });
  }
};

export const completeChallenge = async (req, res) => {
  const { challengeId } = req.body;
  const userId = req.userid;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    if (challenge.completedBy.includes(userId)) {
      return res.status(400).json({ message: "Challenge already completed" });
    }

    challenge.completedBy.push(userId);
    await challenge.save();

    const user = await users.findById(userId);
    user.points += challenge.points;
    await user.save();

    return res.status(200).json({ message: "Challenge completed! Points awarded.", pointsEarned: challenge.points });
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete challenge" });
  }
};

export const addChallenge = async (req, res) => {
  const { title, description, difficulty, points } = req.body;
  try {
    const newChallenge = await Challenge.create({ title, description, difficulty, points });
    return res.status(201).json({ message: "Challenge successfully created", data: newChallenge });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create challenge" });
  }
};
