import user from "../models/auth.js";

// GET user points
export const getUserPoints = async (req, res) => {
  const { id } = req.params;
  try {
    const foundUser = await user.findById(id).select("name points");
    if (!foundUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ data: { points: foundUser.points, name: foundUser.name } });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// AWARD points (called when user answers a question)
export const awardPoints = async (userId, amount) => {
  try {
    await user.findByIdAndUpdate(userId, { $inc: { points: amount } });
  } catch (error) {
    console.log("Error awarding points:", error);
  }
};

// DEDUCT points
export const deductPoints = async (userId, amount) => {
  try {
    await user.findByIdAndUpdate(userId, { $inc: { points: -amount } });
  } catch (error) {
    console.log("Error deducting points:", error);
  }
};

// TRANSFER points between users
export const transferPoints = async (req, res) => {
  const fromUserId = req.userid;
  const { toUserId, points: pointsToTransfer } = req.body;

  try {
    const fromUser = await user.findById(fromUserId);
    if (!fromUser) return res.status(404).json({ message: "Sender not found" });

    if (fromUser.points <= 10) {
      return res.status(403).json({
        message: "You need more than 10 points to transfer. Keep earning and try again!",
      });
    }

    const pts = parseInt(pointsToTransfer);
    if (isNaN(pts) || pts <= 0) return res.status(400).json({ message: "Invalid points amount" });
    if (pts > fromUser.points) return res.status(400).json({ message: "Insufficient points" });

    const toUser = await user.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: "Recipient user not found" });
    if (fromUserId === toUserId) return res.status(400).json({ message: "Cannot transfer to yourself" });

    await user.findByIdAndUpdate(fromUserId, { $inc: { points: -pts } });
    await user.findByIdAndUpdate(toUserId, { $inc: { points: pts } });

    res.status(200).json({
      message: `Successfully transferred ${pts} points to ${toUser.name}!`,
      yourNewPoints: fromUser.points - pts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// SEARCH users for transfer
export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const currentUserId = req.userid;
  try {
    const users = await user
      .find({
        name: { $regex: query, $options: "i" },
        _id: { $ne: currentUserId },
      })
      .select("name email points")
      .limit(10);
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
