const Message = require("../models/messageModel");

exports.sendMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Create new message
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    // Emit socket event to notify receiver
    // ...

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { userId, recipientId } = req.params;

    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: recipientId },
        { sender: recipientId, receiver: userId },
      ],
    });

    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};
