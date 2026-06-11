import Message from "../models/message.js";

export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.userid;

  if (!receiverId || !content) {
    return res.status(400).json({ message: "Receiver ID and content are required" });
  }

  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });
    await newMessage.save();

    return res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

export const getConversation = async (req, res) => {
  const { userId2 } = req.params;
  const userId1 = req.userid;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort({ createdAt: 1 }).populate("sender", "name email").populate("receiver", "name email");

    return res.status(200).json({ data: messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch conversation" });
  }
};
