// backend/routes/message.route.js
import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import {
  getChats,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
} from '../controllers/message.controller.js';

const router = express.Router();

// Get all chats
router.get('/chats', protectRoute, getChats);

// Get messages for a specific chat
router.get('/:chatId', protectRoute, getMessages);

// Send a message to a user
router.post('/send/:receiverId', protectRoute, sendMessage);

// Mark messages as read
router.put('/read/:chatId', protectRoute, markAsRead);

// Delete a message
router.delete('/:messageId', protectRoute, deleteMessage);

export default router;