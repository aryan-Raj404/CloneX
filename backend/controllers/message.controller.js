// backend/controllers/message.controller.js
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import Notification from '../models/notification.model.js';

// Get all chats for logged in user
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'fullName username profileImg')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 })
      .exec();

    // Format chats to match frontend expectations
    const formattedChats = chats.map((chat) => {
      const participant = chat.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      const unreadCount = chat.lastMessage
        ? chat.lastMessage.isRead
          ? 0
          : 1
        : 0;

      return {
        _id: chat._id,
        participant,
        lastMessage: chat.lastMessage,
        unreadCount,
      };
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'fullName username profileImg')
      .sort({ createdAt: 1 })
      .exec();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Find or create chat between two users
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
      });
    }

    // Create message
    const message = await Message.create({
      chatId: chat._id,
      senderId,
      content: content.trim(),
    });

    // Populate message details
    await message.populate('senderId', 'fullName username profileImg');

    // Update chat's last message and time
    chat = await Chat.findByIdAndUpdate(
      chat._id,
      {
        lastMessage: message._id,
        lastMessageTime: new Date(),
      },
      { new: true }
    );

    const newNotification = new Notification({
            type: "message",
            from: senderId,
            to: receiverId,
          });
    
          await newNotification.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark all unread messages in this chat (that aren't from the user) as read
    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a message (only by sender)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};